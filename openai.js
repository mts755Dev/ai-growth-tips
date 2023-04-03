import { Configuration, OpenAIApi } from 'openai';

export const generateTips = async (merchantData) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const prompt = `Give 5 actionable tips to make killer growth of ${merchantData.report.store.name} this week, based on the given data of last week. They sell in ${merchantData.report.store.address.city}, ${merchantData.report.store.address.state}, ${merchantData.report.store.address.country}. They had ${merchantData.report.sales_made} in sales, expected sales was ${merchantData.report.expected_sales}, ${merchantData.report.new_customers} new customers, ${merchantData.report.returning_customers} returning customers, ${merchantData.report.total_orders} orders. Their sales were ${merchantData.report.sales_improvement}, ${merchantData.report.visit_count_value} than last week, customer improvement ${merchantData.report.customer_improvement}, visit improvement ${merchantData.report.visit_improvement}, and website visits ${merchantData.report.website_visit_count}. Their top performing channels are ${Object.values(merchantData.report.top_5_channels).map((value, index) => `${Object.keys(merchantData.report.top_5_channels)[index]} (${value}%)`).join(', ')}. Start with hello to brand name then give short analysis of last week sales then give 5 tips and end with summary of tips.`;
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 512,
      top_p: 1,
      presence_penalty: 0,

      frequency_penalty: 0,
    });
    const tips = response.data.choices[0].text.trim().split('\n');
    return { [merchantData.report.store.name]: tips };
  } catch (err) {
    console.error('Error generating tips:', err);
    throw err;
  }
};
