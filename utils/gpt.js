let axios = require('axios');
const openAIKey = process.env.OPEN_AI_API_KEY;

export async function summarize(url) {
  const prompt = `Breakdown this article in a TLDR style format with 500 characters maximum. Explain it as a statement. Don't start the response with "This article is" : `;
  try {
    const messages = [{ "role": "system", "content": `${prompt} ${url}` }];

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      "model": "gpt-3.5-turbo",
      "messages": messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
    });


    const json = await response.data;
    return json.choices[0].message.content;
  } catch (e) {
    console.log('error while summarizing', e);
    return '';
  }
}

export async function rephraseTweet(text) {
  const prompt = 'This is the text from a Tweet. Rephrase it in a way that is more understandable. Do not prefix with any other text. Remove all the URLs from the tweet. Just return the rephrased text -';
  try {
    const messages = [{ "role": "system", "content": `${prompt} ${text}` }];

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      "model": "gpt-3.5-turbo",
      "messages": messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
    });


    const json = await response.data;
    return json.choices[0].message.content;
  } catch (e) {
    console.log('error while summarizing', e);
    return '';
  }
}

export async function generateTitle(summary) {
  try {
    const messages = [{ "role": "system", "content": `Can you generate a title for this summary. Do not prefix with any other text. Just return the title - ${summary}` }];

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      "model": "gpt-3.5-turbo",
      "messages": messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
    });


    const json = await response.data;
    return json.choices[0].message.content;
  } catch (e) {
    console.log('error while generating title', e);
    return '';
  }
}