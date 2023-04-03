import express from 'express';
import { Worker } from 'worker_threads';
import Redis from 'ioredis';
import dotenv from "dotenv";
import { generateTips } from "./src/openai.js";

dotenv.config();

const app = express();
const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

app.post('/tips/single-merchant', async (req, res) => {
  const merchantData = req.body;
  await redis.lpush('tasks', JSON.stringify(merchantData));
  try {
    const tips = await generateTips(merchantData);
    res.status(200).json(tips);
  } catch (err) {
    console.error('Error generating tips:', err);
    res.status(500).json({ error: err });
  }
});

app.post('/tips/multiple-merchant', async (req, res) => {
  const companies = req.body.companies;
  const tips = [];
  for (const company of companies) {
    try {
      const generatedTips = await generateTips(company);
      tips.push(generatedTips);
    } catch (err) {
      console.error(`Error generating tips for ${company.merchant_name}:`, err);
      tips.push({ error: err });
    }
  }
  res.status(200).json({ Tips: tips });
});

const numWorkers = process.env.WEB_CONCURRENCY || 1;
for (let i = 0; i < numWorkers; i++) {
  const worker = new Worker('./openai.js');
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
