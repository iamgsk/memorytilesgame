let gridSize, timerInterval, startTime, score = 0;
let highScores = {}; // Object to store high scores by tile count
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'teal'];
const greekAlphabets = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ'];
const gameContainer = document.getElementById('game-container');
const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
const highScoreTable = document.createElement('div'); // High score table container

// Append high scores table to the game container
highScoreTable.id = 'high-scores';
highScoreTable.innerHTML = '<h3>High Scores:</h3><table id="high-score-table"><thead><tr><th>Tile Count</th><th>Time (s)</th><th>Score</th></tr></thead><tbody></tbody></table>';
gameContainer.appendChild(highScoreTable);

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('restart-game').addEventListener('click', restartGame);

function startGame() {
  const sizeInput = parseInt(document.getElementById('grid-size').value);
  if (sizeInput < 3 || sizeInput > 6) {
    alert("Please select a size between 3 and 6.");
    return;
  }
  gridSize = sizeInput;
  document.getElementById('start-page').classList.add('hidden');
  gameContainer.classList.remove('hidden');
  initializeGame(gridSize);
}

function initializeGame(size) {
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  const numTiles = size * size;
  const items = shuffle([...colors, ...greekAlphabets].slice(0, numTiles / 2));
  const tiles = shuffle([...items, ...items]);

  gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gameBoard.innerHTML = '';

  tiles.forEach((item, index) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    if (isColor(item)) {
      tile.style.backgroundColor = item;
    } else {
      tile.textContent = item;
      tile.style.color = 'white';
      tile.style.fontSize = '24px';
    }
    tile.dataset.match = item;
    tile.dataset.index = index;
    gameBoard.appendChild(tile);
  });

  setTimeout(hideAllTiles, 2000);

  startTimer();
  addTileClickHandlers();
}

function hideAllTiles() {
  const tiles = Array.from(document.querySelectorAll('.tile'));
  tiles.forEach(tile => {
    tile.style.backgroundColor = 'gray';
    tile.textContent = '';
  });
}

function addTileClickHandlers() {
  const tiles = Array.from(document.querySelectorAll('.tile'));
  let firstTile = null, secondTile = null;

  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      if (tile.classList.contains('matched') || tile === firstTile || secondTile) return;

      if (isColor(tile.dataset.match)) {
        tile.style.backgroundColor = tile.dataset.match;
      } else {
        tile.textContent = tile.dataset.match;
      }

      if (!firstTile) {
        firstTile = tile;
      } else {
        secondTile = tile;
        if (firstTile.dataset.match === secondTile.dataset.match) {
          firstTile.classList.add('matched');
          secondTile.classList.add('matched');
          firstTile = secondTile = null;
          score += 10;
          scoreDisplay.textContent = `Score: ${score}`;
          checkWinCondition();
        } else {
          setTimeout(() => {
            resetTile(firstTile);
            resetTile(secondTile);
            firstTile = secondTile = null;
          }, 500);
        }
      }
    });
  });
}

function resetTile(tile) {
  tile.style.backgroundColor = 'gray';
  tile.textContent = '';
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Time: ${elapsedTime}s`;
    if (elapsedTime >= 60) {
      clearInterval(timerInterval);
      alert("Time's up! Restart the game.");
      addHighScore(elapsedTime);
      restartGame();
    }
  }, 1000);
}

function isColor(value) {
  return colors.includes(value);
}

function checkWinCondition() {
  const unmatchedTiles = Array.from(document.querySelectorAll('.tile:not(.matched)'));
  if (unmatchedTiles.length === 0) {
    clearInterval(timerInterval);
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    addHighScore(elapsedTime);
    throwConfetti();
    alert(`You won! Your score: ${score}`);
  }
}

function addHighScore(time) {
  const tileCount = gridSize * gridSize;

  if (!highScores[tileCount]) {
    highScores[tileCount] = [];
  }

  highScores[tileCount].push({ time, score });
  highScores[tileCount].sort((a, b) => a.time - b.time || b.score - a.score); // Sort by time, then score
  highScores[tileCount] = highScores[tileCount].slice(0, 3); // Keep only top 3

  updateHighScoresDisplay();
}

function updateHighScoresDisplay() {
  const highScoreTableBody = document.querySelector('#high-score-table tbody');
  highScoreTableBody.innerHTML = '';

  for (const tileCount in highScores) {
    highScores[tileCount].forEach(({ time, score }) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${tileCount}</td><td>${time}</td><td>${score}</td>`;
      highScoreTableBody.appendChild(row);
    });
  }
}

function throwConfetti() {
  confettiCanvas.classList.remove('hidden');
  const confettiParticles = [];

  for (let i = 0; i < 50; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -10,
      size: Math.random() * 5 + 3,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }

  const renderConfetti = () => {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p => {
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(p.x, p.y, p.size, p.size);
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
    });

    if (confettiParticles.some(p => p.y < confettiCanvas.height)) {
      requestAnimationFrame(renderConfetti);
    } else {
      confettiCanvas.classList.add('hidden');
    }
  };

  renderConfetti();
}

function restartGame() {
  clearInterval(timerInterval);
  initializeGame(gridSize); // Reinitialize the game with the current grid size
}
