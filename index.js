const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Use express.json() middleware to parse incoming JSON data
app.use(express.json());

app.get('/', (req, res) => {
  // Read the high scores from the file
  fs.readFile('highscores.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading high scores.');
    }

    let scores;
    try {
      scores = JSON.parse(data);
    } catch (error) {
      scores = [];
    }

    res.json(scores.slice(0, 10));
  });
});

app.post('/', (req, res) => {
  const { score, email, name } = req.body;

  if (!score || !email || !name) {
    return res.status(400).send('Score, email, and name are required.');
  }

  // Read the current high scores
  fs.readFile('highscores.json', 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).send('Error reading high scores.');
    }

    let scores;
    try {
      scores = JSON.parse(data);
    } catch (error) {
      scores = [];
    }

    // Add the new score along with email and name
    scores.push({ score, email, name });

    // Optionally, you can sort and limit the scores here
    scores.sort((a, b) => b.score - a.score); // Sort in descending order by score

    // Save the updated scores
    fs.writeFile('highscores.json', JSON.stringify(scores, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error saving high scores.');
      }

      res.send('Score saved successfully.');
    });
  });
});

app.listen(port, () => {
  console.log(`✨ Helper app listening on port ${port}`);
});