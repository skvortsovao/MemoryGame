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
    let boardSize = parseInt(localStorage.getItem('boardSize')) || 4;
    let pattern = localStorage.getItem('pattern') || 'food';
    let timer = parseInt(localStorage.getItem('timer')) || 0;
    let moves = parseInt(localStorage.getItem('moves')) || 0;
    let matchedPairs = parseInt(localStorage.getItem('matchedPairs')) || 0;
    let firstCard = null;
    let secondCard = null;
    let timerInterval;
    let images = JSON.parse(localStorage.getItem('images')) || [];
    let totalMoves = parseInt(localStorage.getItem('totalMoves')) || 0;
    let gameStarted = JSON.parse(localStorage.getItem('gameStarted')) || false;

    boardSizeSelector.value = boardSize;
    patternSelector.value = pattern;
    
    startGameButton.addEventListener('click', startGame);

    function startGame() {
        boardSize = parseInt(boardSizeSelector.value);
        pattern = patternSelector.value;
        localStorage.setItem('boardSize', boardSize);
        localStorage.setItem('pattern', pattern);
        resetGame();
        generateImages();
        setupBoard();
        gameStarted = true;
        localStorage.setItem('gameStarted', true);
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
        localStorage.removeItem('gameState');
        localStorage.setItem('moves', moves);
        localStorage.setItem('matchedPairs', matchedPairs);
        localStorage.setItem('timer', timer);
        localStorage.setItem('gameStarted', false);
    }

    function generateImages() {
        const totalCards = boardSize * boardSize;
        images = [];
        for (let i = 1; i <= totalCards / 2; i++) {
            images.push(`images/${pattern}/${i}.png`);
        }
        images = [...images, ...images];
        images.sort(() => Math.random() - 0.5);
        localStorage.setItem('images', JSON.stringify(images));
    }

    function setupBoard() {
        if (!images.length) {
            generateImages();
        }
        gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
        
        images.forEach((image, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.image = image;
            card.dataset.index = index;
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
        restoreGameState();
        movesElement.textContent = moves;
        if (gameStarted) startTimer();
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
            totalMoves++;
            movesElement.textContent = moves;
            localStorage.setItem('moves', moves);
            localStorage.setItem('totalMoves', totalMoves);
            checkMatch();
        }
    }

    function checkMatch() {
        if (firstCard.dataset.image === secondCard.dataset.image) {
            matchedPairs++;
            matchSound.play();
            firstCard = null;
            secondCard = null;
            localStorage.setItem('matchedPairs', matchedPairs);
            saveGameState();
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
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = timer;
            localStorage.setItem('timer', timer);
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval);
        winMessage.classList.remove('hidden');
    }

    function saveGameState() {
        const cardsState = Array.from(document.querySelectorAll('.card')).map(card => ({
            index: card.dataset.index,
            flipped: card.classList.contains('flipped')
        }));
        localStorage.setItem('gameState', JSON.stringify(cardsState));
    }

    function restoreGameState() {
        const savedGameState = JSON.parse(localStorage.getItem('gameState'));
        if (savedGameState) {
            savedGameState.forEach(({ index, flipped }) => {
                const card = document.querySelector(`.card[data-index='${index}']`);
                if (flipped) card.classList.add('flipped');
            });
        }
    }

    window.addEventListener('storage', (event) => {
        if (event.key === 'totalMoves') {
            movesElement.textContent = localStorage.getItem('totalMoves');
        }
    });

    setupBoard();
});
