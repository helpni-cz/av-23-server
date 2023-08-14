const holes = document.querySelectorAll('.hole');
const scoreCounter = document.querySelectorAll('.score');
const moles = document.querySelectorAll('.mole');
const modal = document.querySelector('.modal');
const welcomeDiv = document.querySelector('#welcome');
const yourscoreDiv = document.querySelector('#yourscore');
const scoreboardDiv = document.querySelector('#scoreboard');

const SERVER_URL = 'https://score.helpni.cz:3000/score';

let lastHole;
let timeUp = false;
let score = 0;
let countdown;
function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    console.log('Ah nah thats the same one bud');
    return randomHole(holes);
  }
  lastHole = hole;
  return hole;
}

function peep() {
  const time = randomTime(400, 1000);
  const hole = randomHole(holes);
  hole.classList.add('up');
  moles.forEach(mole => mole.isHit = false); // reset all moles to not-hit
  setTimeout(() => {
    hole.classList.remove('up');
    if (!timeUp) peep();
  }, time);
}

function startGame() {
  welcomeDiv.style.display = 'none';
  scoreboardDiv.style.display = 'none';
  modal.style.display = 'none';
  scoreCounter.textContent = 0;
  timeUp = false;
  score = 0;
  peep();
  countdown = 15; // Set the countdown
  const countdownElement = document.querySelector('.countdown'); // Get the countdown element
  countdownElement.textContent = countdown; // Display the countdown
  const intervalId = setInterval(() => { // Start the countdown
    countdown--;
    countdownElement.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(intervalId); // Stop the countdown
      timeUp = true;
      modal.style.display = '';
      yourscoreDiv.style.display = 'block';
    }
  }, 1000); // 1000 ms = 1 second
}

function bonk(e) {
  if (!e.isTrusted || this.isHit) {
    console.log('cheater!')
    return;
  }// cheater or already hit!
  this.isHit = true; // mark as hit
  score++;

  this.parentNode.classList.remove('up');
  scoreCounter.forEach(item => item.textContent = score)
}

async function saveScore() {
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;

  const scoreData = { name, email, score };
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.log('Success in submitting score:', data);

    const boardResponse = await fetch(SERVER_URL);
    const board = await boardResponse.json();

    yourscoreDiv.style.display = 'none';
    scoreboardDiv.style.display = 'block';
    const scoreboardElement = document.querySelector('#scoreboard-body');
    scoreboardElement.innerHTML = '';
    board.forEach((score, index) => {
      scoreboardElement.innerHTML += `<tr><td>${index + 1}</td><td>${score.name}</td><td>${score.email}</td><td>${score.score}</td></tr>`;
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

moles.forEach(mole => mole.addEventListener('touchend', bonk));
moles.forEach(mole => mole.addEventListener('dblclick', () => { }));