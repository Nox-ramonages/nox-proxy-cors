const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// OPTIONS pour le preflight CORS
app.options('*', cors(), (req, res) => {
  res.sendStatus(200);
});

// PROXY PRINCIPAL
app.all('/', async (req, res) => {
  const targetUrl = 'https://script.google.com/macros/s/AKfycbx8KX7O5I4UbcTaBfuBkMZwPKH9lp8uICkwxy2bjBqtbyDKBC6bXef_j7Fygd6eInTw/exec';

  try {
    // Pour GET, on forward tout simplement
    if (req.method === 'GET') {
      const url = `${targetUrl}?${new URLSearchParams(req.query).toString()}`;
      const fetchRes = await fetch(url);
      const data = await fetchRes.text();
      res.setHeader('Content-Type', 'application/json');
      res.status(fetchRes.status).send(data);
      return;
    }

    // Pour POST, Apps Script attend x-www-form-urlencoded, pas JSON !
    if (req.method === 'POST') {
      const params = req.body;
      const form = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        form.append(key, value);
      }
      const fetchRes = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });
      const data = await fetchRes.text();
      res.setHeader('Content-Type', 'application/json');
      res.status(fetchRes.status).send(data);
      return;
    }

    res.status(405).send('Method Not Allowed');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Proxy Nox CORS listening on port', port));
