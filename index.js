const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Important: Réponse aux requêtes OPTIONS (préflight)
app.options('*', cors(), (req, res) => {
  res.sendStatus(200);
});

// Proxy principal (GET et POST)
app.all('/', async (req, res) => {
  const targetUrl = 'https://script.google.com/macros/s/AKfycbxfTscFJS9FQ1GW3p4oJfZQAs_HkWVh5YjjXm1YKsWEAZmjVM2HsheoqUOVT2F2x7CQ/exec';
  let params = req.method === 'GET' ? req.query : req.body;
  let method = req.method;
  let options = {};

  if (method === 'POST') {
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    };
  }

  try {
    const url = method === 'GET'
      ? `${targetUrl}?${new URLSearchParams(params).toString()}`
      : targetUrl;
    const fetchRes = await fetch(url, options);
    const data = await fetchRes.text();
    res.setHeader('Content-Type', 'application/json');
    res.status(fetchRes.status).send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Proxy Nox CORS listening on port', port));
