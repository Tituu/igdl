const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

async function fetchMediaData(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const $ = cheerio.load(response.data);
  const scriptTag = $('script[type="application/ld+json"]').html();

  if (!scriptTag) throw new Error('Media not found or private.');
  const jsonData = JSON.parse(scriptTag);

  let media = [];

  if (Array.isArray(jsonData.image)) {
    media = jsonData.image;
  } else if (jsonData.video && jsonData.video.contentUrl) {
    media.push(jsonData.video.contentUrl);
  } else if (jsonData.image) {
    media.push(jsonData.image);
  }

  return {
    title: jsonData.caption || jsonData.name || 'Instagram Media',
    media,
  };
}

app.get('/api/download', async (req, res) => {
  const { url } = req.query;
  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Invalid or missing Instagram URL' });
  }

  try {
    const result = await fetchMediaData(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Instagram Downloader API by ChatGPT');
});

module.exports = app;
