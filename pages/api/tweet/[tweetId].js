let axios = require('axios');
import { rephraseTweet, generateTitle } from "../../../utils/gpt";

const twitterToken = process.env.TWITTER_API_KEY;
export default async function handler(req, res) {
  const query = req.query;
  const { tweetId } = query;

  console.log('tweetId', tweetId);
  try {
    const tweet = await axios.get(`https://api.twitter.com/2/tweets?ids=${tweetId}`, {
      headers: {
        'Authorization': `Bearer ${twitterToken}`,
        "Content-Type": "application/json",
      },
    });


    const rephrased = rephraseTweet(tweet?.data?.data[0]?.text);
    const title = generateTitle(tweet?.data?.data[0]?.text);

    const results = await Promise.all([rephrased, title]);
    console.log('results', results);

    res.status(200).json({ original: tweet?.data?.data[0], rephrased: results[0], title: results[1] })
  } catch (e) {
    console.log(e);
    res.status(500).json([])
  }
}