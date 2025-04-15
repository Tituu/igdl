const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));

app.get('/api/formats', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("URL is required");

  exec(`yt-dlp -j "${url}"`, (err, stdout, stderr) => {
    if (err) return res.status(500).send("Error fetching formats");

    try {
      const info = JSON.parse(stdout);
      const formats = info.formats.map(f => ({
        format_id: f.format_id,
        ext: f.ext,
        resolution: f.resolution || `${f.width || ''}x${f.height || ''}`,
        format_note: f.format_note,
        filesize: f.filesize || 0,
        acodec: f.acodec,
        vcodec: f.vcodec
      }));

      res.json({
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        formats
      });
    } catch (e) {
      res.status(500).send("Failed to parse format data");
    }
  });
});

app.get('/api/download', (req, res) => {
  const { url, format_id } = req.query;
  if (!url || !format_id) return res.status(400).send("URL and format_id required");

  res.setHeader('Content-Disposition', `attachment; filename="video.${format_id}.mp4"`);

  const process = exec(`yt-dlp -f ${format_id} -o - "${url}"`, { maxBuffer: 1024 * 1024 * 100 });

  process.stdout.pipe(res);
  process.stderr.on('data', data => console.error(data));
  process.on('error', err => res.status(500).send("Download failed"));
});

app.listen(3000, () => console.log('Server running on port 3000'));
