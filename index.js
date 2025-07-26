const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Configuration CORS plus permissive
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OPTIONS pour le preflight CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// PROXY PRINCIPAL
app.all('/', async (req, res) => {
  // URL de votre Google Apps Script (à vérifier/mettre à jour)
  const targetUrl = 'https://script.google.com/macros/s/AKfycbzkCiu3jHWOemdCqiiNnClXSbagsSSbTG1i81DanxByLI0VAx3_iCCPAzPhq4Vy2aaC/exec';

  try {
    let fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    let url = targetUrl;

    // Pour GET, on ajoute les paramètres dans l'URL
    if (req.method === 'GET') {
      if (Object.keys(req.query).length > 0) {
        url = `${targetUrl}?${new URLSearchParams(req.query).toString()}`;
      }
    }

    // Pour POST, on envoie le body en JSON
    if (req.method === 'POST') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    console.log('Requête vers:', url);
    console.log('Méthode:', req.method);
    console.log('Body:', req.method === 'POST' ? req.body : 'N/A');

    const fetchRes = await fetch(url, fetchOptions);
    const data = await fetchRes.text();
    
    console.log('Réponse status:', fetchRes.status);
    console.log('Réponse data:', data);

    // Définir les headers de réponse
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    
    // Essayer de parser le JSON, sinon renvoyer tel quel
    try {
      const jsonData = JSON.parse(data);
      res.status(fetchRes.status).json(jsonData);
    } catch (e) {
      res.status(fetchRes.status).send(data);
    }

  } catch (err) {
    console.error('Erreur proxy:', err);
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Erreur de connexion au serveur',
      details: err.message 
    });
  }
});

// Route de test
app.get('/test', (req, res) => {
  res.json({ message: 'Proxy fonctionne !', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Proxy Nox CORS démarré sur le port ${port}`);
  console.log(`📡 URL de test: http://localhost:${port}/test`);
});
