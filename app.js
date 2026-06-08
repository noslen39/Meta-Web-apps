const cells = Array.from(document.querySelectorAll(".cell"));
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");

const focusables = [...cells, resetBtn];

let board = Array(9).fill("");
let selectedIndex = 0;
let gameOver = false;
let computerThinking = false;

const human = "X";
const computer = "O";

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function render() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];

    cell.classList.toggle("selected", selectedIndex === index);
    cell.classList.toggle("x-mark", board[index] === "X");
    cell.classList.toggle("o-mark", board[index] === "O");
  });

  resetBtn.classList.toggle("selected", selectedIndex === 9);
}

function playMarkEffect(index) {
  cells[index].classList.remove("x-mark", "o-mark");

  // Forces the browser to restart the CSS animation.
  void cells[index].offsetWidth;

  cells[index].classList.add(board[index] === "X" ? "x-mark" : "o-mark");
}

function getWinner() {
  for (const combo of wins) {
    const [a, b, c] = combo;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        player: board[a],
        combo
      };
    }
  }

  return null;
}

function endGameIfNeeded() {
  const winner = getWinner();

  if (winner) {
    gameOver = true;
    statusEl.textContent = winner.player === human ? "You win" : "Computer wins";

    winner.combo.forEach((cellIndex) => {
      cells[cellIndex].classList.add("win");
    });

    render();
    return true;
  }

  if (board.every(Boolean)) {
    gameOver = true;
    statusEl.textContent = "Draw game";
    render();
    return true;
  }

  return false;
}

function findWinningMove(player) {
  for (const combo of wins) {
    const [a, b, c] = combo;
    const values = [board[a], board[b], board[c]];

    const playerCount = values.filter((value) => value === player).length;
    const emptyCount = values.filter((value) => value === "").length;

    if (playerCount === 2 && emptyCount === 1) {
      const emptyPosition = values.indexOf("");
      return combo[emptyPosition];
    }
  }

  return null;
}

function getOpenCells() {
  return board
    .map((value, index) => (value === "" ? index : null))
    .filter((value) => value !== null);
}

function getComputerMove() {
  const winningMove = findWinningMove(computer);
  if (winningMove !== null) return winningMove;

  const blockingMove = findWinningMove(human);
  if (blockingMove !== null) return blockingMove;

  if (board[4] === "") return 4;

  const corners = [0, 2, 6, 8].filter((index) => board[index] === "");
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  const openCells = getOpenCells();
  return openCells[Math.floor(Math.random() * openCells.length)];
}

function computerTurn() {
  if (gameOver) return;

  computerThinking = true;
  statusEl.textContent = "Computer thinking...";

  setTimeout(() => {
    const move = getComputerMove();

    if (move !== undefined) {
      board[move] = computer;
      selectedIndex = move;
      playMarkEffect(move);
    }

    computerThinking = false;

    if (!endGameIfNeeded()) {
      statusEl.textContent = "Your turn";
    }

    render();
  }, 450);
}

function placeHumanMark(index) {
  if (gameOver || computerThinking || board[index]) return;

  board[index] = human;
  playMarkEffect(index);

  if (!endGameIfNeeded()) {
    computerTurn();
  }

  render();
}

function resetGame() {
  board = Array(9).fill("");
  selectedIndex = 0;
  gameOver = false;
  computerThinking = false;
  statusEl.textContent = "Your turn";

  cells.forEach((cell) => {
    cell.classList.remove("win", "x-mark", "o-mark");
  });

  render();
}

function moveSelection(direction) {
  if (computerThinking) return;

  const isOnReset = selectedIndex === 9;

  if (direction === "left") {
    if (!isOnReset && selectedIndex % 3 !== 0) selectedIndex -= 1;
  }

  if (direction === "right") {
    if (!isOnReset && selectedIndex % 3 !== 2) selectedIndex += 1;
  }

  if (direction === "up") {
    if (isOnReset) {
      selectedIndex = 7;
    } else if (selectedIndex >= 3) {
      selectedIndex -= 3;
    }
  }

  if (direction === "down") {
    if (!isOnReset && selectedIndex <= 5) {
      selectedIndex += 3;
    } else {
      selectedIndex = 9;
    }
  }

  render();
}

function activateSelection() {
  if (selectedIndex === 9) {
    resetGame();
    return;
  }

  placeHumanMark(selectedIndex);
}

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    selectedIndex = index;
    placeHumanMark(index);
  });
});

resetBtn.addEventListener("click", resetGame);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moveSelection("left");
  if (event.key === "ArrowRight") moveSelection("right");
  if (event.key === "ArrowUp") moveSelection("up");
  if (event.key === "ArrowDown") moveSelection("down");

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activateSelection();
  }
});

resetGame();