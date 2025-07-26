// index.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // Forward the request method, headers and body
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers, host: undefined }, // Remove host for CORS
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    };

    const response = await fetch(url, fetchOptions);

    // Forward the status, headers, and body
    res.status(response.status);
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });
    const data = await response.text();
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy running on port ' + PORT));
