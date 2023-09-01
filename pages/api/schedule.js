let axios = require('axios');

// const authKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mzg1OCwiZW1haWwiOiJrYXBpbC5rZGs4NjJAZ21haWwuY29tIiwiY3JlYXRlZEF0IjoxNjc1NDA4NTQzNjc2LCJ0eXBlIjoiYXV0aCIsImlhdCI6MTY3NTQwODU0M30.4rrVTZbus-oBDqF2QhbOlJnRt1NvUH7_LPc5MjYS0qI';
export default async function handler(req, res) {
  const baseUrl = "https://cache.showwcase.com";

  const activeUserToken = req.headers['x-api-key'];

  if (req.method === 'GET') {
    try {
      const scheduledThreads = await axios.get(baseUrl + "/threads/scheduled", {
        headers: {
          Authorization: activeUserToken,
          "Content-Type": "application/json",
        },
      });

      res.status(200).json(scheduledThreads.data)
    } catch (e) {
      res.status(500).json([])
    }
  } else if (req.method === 'POST') {
    const { title, summary, time } = req.body;

    const requestBody = {
      "title": title,
      "message": summary,
      scheduledAt: time,
      "mentions": [],
      "images": [],
      "code": "",
      "codeLanguage": "",
      "id": -1,
      "videoUrl": "",
      "linkPreviewUrl": "",
    }

    const scheduledResponse = axios.post(baseUrl + "/threads", requestBody, {
      headers: {
        Authorization: activeUserToken,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json(scheduledResponse.data)
  }
}