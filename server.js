const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  console.log('=== Message reçu ===');
  const { messages, systemPrompt, isInit } = req.body;

  try {
    // Construction du corps de la requête Anthropic
    const requestBody = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: messages
    };

    // Ajout du system prompt si fourni
    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    // Si c'est l'initialisation, on ajoute un message de démarrage
    if (isInit) {
      requestBody.messages = [
        {
          role: 'user',
          content: "Commence par une première question ou observation d'ouverture. Sois bref, poétique et intrigant."
        }
      ];
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur API Anthropic:', data);
      return res.status(500).json({ error: 'Erreur API Anthropic', details: data });
    }

    const reply = data.content?.[0]?.text || null;
    console.log('Réponse IA :', reply);

    res.json({
      choices: [{ message: { content: reply || 'Pas de réponse.' } }]
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VersMoi tourne sur http://localhost:${PORT}`);
});
