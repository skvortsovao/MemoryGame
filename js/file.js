// My ideas before I start: 
// 1) Timer starts when new game button is clicked or first card on the board is clicked
// 2) when card is clicked I want to see "front side" of this card and no matter if I clcik second card or no - first card will be closed through 1 or 2 seconds
// 3) emojis under cards are generated randomly, the main thing - every emoji has theit pair on the board and emojis generates randomly, I don't hard code values under esch cell
// 4) If I click two cards and they match so these cards staying opened and maybe have some color like sign that they are already matched
// 5) Moves count not with every click but with every SECOND click.
// 6) After we have paired all cards I want to see container with text, my moves made through game and time.
// REQUIREMENTS:
// 1) Point out one place in your code where you used a Functional programming concept (Anything in Chapter 11)
// 2) Point out one place in your code where you manipulated the DOM with Javascript.
// 3) Point out one place in your code where you either added listening to an event or you handled an event.
// 4) Point out one place in your code where you used an ES6 feature.
document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const startGameButton = document.getElementById('startGame');
    const boardSizeSelector = document.getElementById('boardSize');
    const patternSelector = document.getElementById('pattern');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const winMessage = document.getElementById('winMessage');
    const matchSound = new Audio('sounds/matched.wav');
    const clickSound = new Audio('sounds/clicked.wav');
    const winSound = new Audio('sounds/win.wav');
    let boardSize = 4;
    let pattern = 'food';
    let timer = 0;
    let moves = 0;
    let matchedPairs = 0; 
    let firstCard = null;
    let secondCard = null;
    let timerInterval;
    let images = []; 
  
    startGameButton.addEventListener('click', startGame);
    
    
  
    function startGame() {
      boardSize = parseInt(boardSizeSelector.value);
      pattern = patternSelector.value;
      resetGame();
      setupBoard();
      startTimer();
    }
  
    function resetGame() {
      clearInterval(timerInterval);
      timer = 0;
      moves = 0;
      matchedPairs = 0; 
      firstCard = null;
      secondCard = null;
      timerElement.textContent = timer;
      movesElement.textContent = moves;
      gameBoard.innerHTML = '';
      winMessage.classList.add('hidden'); 
    }
  
    function setupBoard() {
      const totalCards = boardSize * boardSize;
      images = [];
      for (let i = 1; i <= totalCards / 2; i++) {
        images.push(`images/${pattern}/${i}.png`); 
      }
      images = [...images, ...images]; 
      images.sort(() => Math.random() - 0.5); 
      gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
      gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
      images.forEach((image) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;
        card.addEventListener('click', flipCard);
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.style.backgroundImage = `url(${image})`;
  
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
  
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        gameBoard.appendChild(card);
      });
    }
  
    function flipCard() {
        clickSound.play();
      if (this.classList.contains('flipped') || secondCard) return;
  
      this.classList.add('flipped');
  
      if (!firstCard) {
        firstCard = this;
      } else {
        secondCard = this;
        moves++;
        movesElement.textContent = moves;
        checkMatch();
      }
    }
  
    function checkMatch() {
      if (firstCard.dataset.image === secondCard.dataset.image) {
        matchedPairs++;
        matchSound.play();
        firstCard = null;
        secondCard = null;
        if (matchedPairs === images.length / 2) {
            winSound.play();
          endGame(); 
        }
      } else {
        setTimeout(() => {
          firstCard.classList.remove('flipped');
          secondCard.classList.remove('flipped');
          firstCard = null;
          secondCard = null;
        }, 1000);
      }
    }
  
    function startTimer() {
      timerInterval = setInterval(() => {
        timer++;
        timerElement.textContent = timer;
      }, 1000);
    }
  
    function endGame() {
      clearInterval(timerInterval); 
      winMessage.classList.remove('hidden');
    }
  });