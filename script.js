const difficultySettings = {
  easy: {
    label: "Easy",
    goal: 15,
    time: 35,
    spawnRate: 950
  },
  normal: {
    label: "Normal",
    goal: 20,
    time: 30,
    spawnRate: 800
  },
  hard: {
    label: "Hard",
    goal: 25,
    time: 25,
    spawnRate: 650
  }
};

let selectedDifficulty = "easy";
let currentCans = 0;
let gameActive = false;
let spawnInterval = null;
let timerInterval = null;
let timeLeft = difficultySettings[selectedDifficulty].time;
let shownMilestones = [];

// Sound effects
const clickSound = new Audio("sounds/click.mp3");
const collectSound = new Audio("sounds/collect.mp3");
const winSound = new Audio("sounds/win.mp3");
const loseSound = new Audio("sounds/lose.mp3");

// optional volume control
clickSound.volume = 0.5;
collectSound.volume = 0.6;
winSound.volume = 0.7;
loseSound.volume = 0.7;

const winMessages = [
  "Amazing! You helped provide clean water 💧",
  "You're making a real impact!",
  "Incredible work, water hero!"
];

const loseMessages = [
  "So close! Try again!",
  "Keep going, every drop counts!",
  "You can do it!"
];

const milestoneMessages = [
  { score: 5, text: "Nice start! Every can counts 💙" },
  { score: 10, text: "Halfway there! Keep going!" },
  { score: 15, text: "Amazing progress! You're doing great!" },
  { score: 20, text: "So close to the finish line!" },
  { score: 25, text: "Water hero status unlocked! 💧🏆" }
];

const grid = document.querySelector(".game-grid");
const currentCansEl = document.getElementById("current-cans");
const timerEl = document.getElementById("timer");
const goalDisplayEl = document.getElementById("goal-display");
const achievementsEl = document.getElementById("achievements");
const milestoneEl = document.getElementById("milestone-message");
const currentDifficultyEl = document.getElementById("current-difficulty");
const overlay = document.getElementById("instruction-overlay");
const startOverlayBtn = document.getElementById("start-from-overlay");
const startGameBtn = document.getElementById("start-game");
const resetGameBtn = document.getElementById("reset-game");
const difficultyDetails = document.getElementById("difficulty-details");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {
    // avoids errors if browser blocks autoplay
  });
}

function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    grid.appendChild(cell);
  }
}

function updateDifficultyUI() {
  const settings = difficultySettings[selectedDifficulty];
  difficultyDetails.textContent = `${settings.label}: Collect ${settings.goal} cans in ${settings.time} seconds`;
  currentDifficultyEl.textContent = settings.label;
  goalDisplayEl.textContent = settings.goal;
  timerEl.textContent = settings.time;

  difficultyButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === selectedDifficulty);
  });
}

function spawnWaterCan() {
  if (!gameActive) return;

  const cells = document.querySelectorAll(".grid-cell");

  // clear old cans from DOM
  cells.forEach(cell => {
    cell.innerHTML = "";
  });

  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  const wrapper = document.createElement("div");
  wrapper.className = "water-can-wrapper";

  const can = document.createElement("div");
  can.className = "water-can";

  can.addEventListener("click", () => {
    if (!gameActive) return;

    currentCans++;
    currentCansEl.textContent = currentCans;

    playSound(collectSound);

    can.style.transform = "scale(1.18)";
    can.style.opacity = "0.7";

    checkMilestones();

    setTimeout(() => {
      wrapper.remove(); // DOM removal requirement
    }, 80);
  });

  wrapper.appendChild(can);
  randomCell.appendChild(wrapper);
}

function checkMilestones() {
  milestoneMessages.forEach(milestone => {
    if (currentCans === milestone.score && !shownMilestones.includes(milestone.score)) {
      milestoneEl.textContent = milestone.text;
      shownMilestones.push(milestone.score);

      setTimeout(() => {
        if (milestoneEl.textContent === milestone.text) {
          milestoneEl.textContent = "";
        }
      }, 1800);
    }
  });
}

function startTimer() {
  const settings = difficultySettings[selectedDifficulty];
  timeLeft = settings.time;
  timerEl.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function clearBoard() {
  const cells = document.querySelectorAll(".grid-cell");
  cells.forEach(cell => {
    cell.innerHTML = "";
  });
}

function startGame() {
  if (gameActive) return;

  const settings = difficultySettings[selectedDifficulty];

  gameActive = true;
  currentCans = 0;
  shownMilestones = [];
  currentCansEl.textContent = 0;
  achievementsEl.textContent = "";
  milestoneEl.textContent = "";
  goalDisplayEl.textContent = settings.goal;
  timerEl.textContent = settings.time;
  currentDifficultyEl.textContent = settings.label;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  createGrid();
  spawnWaterCan();
  spawnInterval = setInterval(spawnWaterCan, settings.spawnRate);
  startTimer();

  resetGameBtn.style.display = "inline-block";
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearBoard();

  const settings = difficultySettings[selectedDifficulty];
  let message = "";

  if (currentCans >= settings.goal) {
    message = winMessages[Math.floor(Math.random() * winMessages.length)];
    achievementsEl.style.color = "#8CFF98";
    playSound(winSound);

    setTimeout(() => {
      alert(`You Win! 🎉 You collected ${currentCans} cans!`);
    }, 150);
  } else {
    message = loseMessages[Math.floor(Math.random() * loseMessages.length)];
    achievementsEl.style.color = "#FFB3B3";
    playSound(loseSound);
  }

  achievementsEl.textContent = message;
}

function resetGame() {
  playSound(clickSound);

  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  gameActive = false;
  currentCans = 0;
  shownMilestones = [];
  achievementsEl.textContent = "";
  milestoneEl.textContent = "";
  currentCansEl.textContent = 0;
  updateDifficultyUI();
  createGrid();
}

difficultyButtons.forEach(button => {
  button.addEventListener("click", () => {
    playSound(clickSound);
    selectedDifficulty = button.dataset.mode;
    updateDifficultyUI();
  });
});

startOverlayBtn.addEventListener("click", () => {
  playSound(clickSound);
  overlay.style.display = "none";
  startGame();
});

startGameBtn.addEventListener("click", () => {
  playSound(clickSound);
  startGame();
});

resetGameBtn.addEventListener("click", resetGame);

createGrid();
updateDifficultyUI();