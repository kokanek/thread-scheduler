import { summarize, generateTitle } from "../../utils/gpt";

export default async function handler(req, res) {
  let url, summary, title;
  try {
    url = req.body.url;
    summary = await summarize(url);
    title = await generateTitle(summary);
    console.log('reached api: ', url, summary)
    res.status(200).json({ summary, title })
  } catch {
    res.status(500).json({})
  }
}