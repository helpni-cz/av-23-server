const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors')
const app = express();
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('static'));

const corsOptions = {
  origin: ['http://localhost:3000', "http://127.0.0.1:3000", "https://game.helpni.cz", "https://av.helpni.cz"],
  optionsSuccessStatus: 200
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

app.get('/score', cors(corsOptions), async (req, res, next) => {
  try {
    const data = await fs.readFile('highscores.json', 'utf8');
    const scores = JSON.parse(data);
    res.json(scores.slice(0, 10));
  } catch (error) {
    next(error);
  }
});

app.post('/score', cors(corsOptions), async (req, res, next) => {
  const { score, email, name } = req.body;

  if (score < 0 || !email || !name) {
    return res.status(400).json({ error: 'Score, email, and name are required.' });
  }

  try {
    let scores;
    try {
      const data = await fs.readFile('highscores.json', 'utf8');
      scores = JSON.parse(data);
    } catch (error) {
      scores = [];
    }

    scores.push({ score, email, name });
    scores.sort((a, b) => b.score - a.score);

    await fs.writeFile('highscores.json', JSON.stringify(scores, null, 2));
    res.status(201).json({ message: 'Score saved successfully.' });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`✨ Helper app listening on port ${port}`);
});