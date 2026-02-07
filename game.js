// 초등영어 단어 리스트
const wordPairs = [
    { english: 'bird', korean: '새' },
    { english: 'cat', korean: '고양이' },
    { english: 'dog', korean: '개' },
    { english: 'apple', korean: '사과' },
    { english: 'book', korean: '책' },
    { english: 'tree', korean: '나무' },
    { english: 'flower', korean: '꽃' },
    { english: 'sun', korean: '태양' },
    { english: 'moon', korean: '달' },
    { english: 'star', korean: '별' },
    { english: 'house', korean: '집' },
    { english: 'school', korean: '학교' },
    { english: 'car', korean: '자동차' },
    { english: 'fish', korean: '물고기' },
    { english: 'water', korean: '물' },
    { english: 'milk', korean: '우유' },
    { english: 'door', korean: '문' },
    { english: 'window', korean: '창문' },
    { english: 'chair', korean: '의자' },
    { english: 'table', korean: '테이블' },
    { english: 'pen', korean: '펜' },
    { english: 'pencil', korean: '연필' },
    { english: 'bag', korean: '가방' },
    { english: 'shoe', korean: '신발' },
    { english: 'hat', korean: '모자' },
    { english: 'hand', korean: '손' },
    { english: 'foot', korean: '발' },
    { english: 'eye', korean: '눈' },
    { english: 'nose', korean: '코' },
    { english: 'mouth', korean: '입' }
];

// 난이도 설정
const difficulties = {
    easy: { pairs: 6, totalCards: 12, cols: 'cols-4' },
    medium: { pairs: 9, totalCards: 18, cols: 'cols-6' },
    hard: { pairs: 12, totalCards: 24, cols: 'cols-6' }
};

// 게임 상태 변수
let currentDifficulty = 'easy';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let canFlip = true;
let currentWords = [];

// 측정 변수
let moves = 0;
let startTime = null;
let timerInterval = null;
let isPaused = false;
let score = 0;

// DOM 요소
const difficultyScreen = document.getElementById('difficultyScreen');
const gameScreen = document.getElementById('gameScreen');
const gameBoard = document.getElementById('gameBoard');
const progressElement = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');

// 통계 요소
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');
const scoreElement = document.getElementById('score');
const accuracyElement = document.getElementById('accuracy');

// 버튼 요소
const backBtn = document.getElementById('backBtn');
const resetBtn = document.getElementById('resetBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 모달 요소
const completionModal = document.getElementById('completionModal');
const pauseModal = document.getElementById('pauseModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const changeDifficultyBtn = document.getElementById('changeDifficultyBtn');
const resumeBtn = document.getElementById('resumeBtn');
const quitBtn = document.getElementById('quitBtn');

// 최고 기록 요소
const bestEasyElement = document.getElementById('bestEasy');
const bestMediumElement = document.getElementById('bestMedium');
const bestHardElement = document.getElementById('bestHard');

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    loadBestScores();
    setupDifficultySelection();
    setupButtons();
});

// 최고 기록 불러오기
function loadBestScores() {
    const scores = {
        easy: localStorage.getItem('bestScore_easy'),
        medium: localStorage.getItem('bestScore_medium'),
        hard: localStorage.getItem('bestScore_hard')
    };

    bestEasyElement.textContent = scores.easy ? `${scores.easy}점` : '-';
    bestMediumElement.textContent = scores.medium ? `${scores.medium}점` : '-';
    bestHardElement.textContent = scores.hard ? `${scores.hard}점` : '-';
}

// 난이도 선택 설정
function setupDifficultySelection() {
    const difficultyCards = document.querySelectorAll('.difficulty-card');

    difficultyCards.forEach(card => {
        card.addEventListener('click', () => {
            const difficulty = card.dataset.difficulty;
            startGame(difficulty);
        });
    });
}

// 버튼 이벤트 설정
function setupButtons() {
    backBtn.addEventListener('click', showDifficultyScreen);
    resetBtn.addEventListener('click', () => startGame(currentDifficulty));
    pauseBtn.addEventListener('click', togglePause);
    playAgainBtn.addEventListener('click', () => {
        closeModal(completionModal);
        startGame(currentDifficulty);
    });
    changeDifficultyBtn.addEventListener('click', () => {
        closeModal(completionModal);
        showDifficultyScreen();
    });
    resumeBtn.addEventListener('click', togglePause);
    quitBtn.addEventListener('click', () => {
        closeModal(pauseModal);
        showDifficultyScreen();
    });
}

// 난이도 화면 표시
function showDifficultyScreen() {
    stopTimer();
    gameScreen.style.display = 'none';
    difficultyScreen.style.display = 'block';
    loadBestScores();
}

// 게임 시작
function startGame(difficulty) {
    currentDifficulty = difficulty;
    difficultyScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    initGame();
}

// 게임 초기화
function initGame() {
    // 상태 초기화
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    canFlip = true;
    moves = 0;
    score = 1000;
    isPaused = false;

    // 타이머 초기화
    stopTimer();
    startTime = Date.now();
    startTimer();

    // UI 업데이트
    updateStats();
    pauseBtn.textContent = '⏸️ 일시정지';

    // 난이도에 맞는 단어 선택
    const config = difficulties[currentDifficulty];
    currentWords = getRandomWords(config.pairs);

    // 카드 생성
    currentWords.forEach((pair, index) => {
        cards.push({
            id: `eng-${index}`,
            text: pair.english,
            pairId: index,
            type: 'english'
        });
        cards.push({
            id: `kor-${index}`,
            text: pair.korean,
            pairId: index,
            type: 'korean'
        });
    });

    // 카드 섞기
    shuffleArray(cards);

    // 게임 보드 렌더링
    renderBoard();
    updateProgress();
}

// 랜덤 단어 선택
function getRandomWords(count) {
    const shuffled = [...wordPairs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 배열 섞기
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 게임 보드 렌더링
function renderBoard() {
    const config = difficulties[currentDifficulty];
    gameBoard.className = `game-board ${config.cols}`;
    gameBoard.innerHTML = '';

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.textContent = '?';
        cardElement.addEventListener('click', () => flipCard(index));
        gameBoard.appendChild(cardElement);
    });
}

// 카드 뒤집기
function flipCard(index) {
    if (!canFlip || isPaused) return;

    const cardElement = gameBoard.children[index];
    const card = cards[index];

    // 이미 뒤집힌 카드거나 매칭된 카드는 무시
    if (cardElement.classList.contains('flipped') ||
        cardElement.classList.contains('matched')) {
        return;
    }

    // 카드 뒤집기
    cardElement.classList.add('flipped');
    cardElement.textContent = card.text;
    flippedCards.push({ index, card });

    // 2개의 카드가 뒤집혔을 때
    if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        updateStats();
        checkMatch();
    }
}

// 매칭 확인
function checkMatch() {
    const [first, second] = flippedCards;

    // 같은 pairId를 가지고 있으면 매칭 성공
    if (first.card.pairId === second.card.pairId) {
        // 매칭 성공
        setTimeout(() => {
            gameBoard.children[first.index].classList.add('matched');
            gameBoard.children[second.index].classList.add('matched');

            matchedPairs++;
            score += 50; // 매칭 성공 보너스
            updateProgress();
            updateStats();

            flippedCards = [];
            canFlip = true;

            // 모든 카드가 매칭되었는지 확인
            const config = difficulties[currentDifficulty];
            if (matchedPairs === config.pairs) {
                setTimeout(() => {
                    endGame();
                }, 500);
            }
        }, 500);
    } else {
        // 매칭 실패
        gameBoard.children[first.index].classList.add('wrong');
        gameBoard.children[second.index].classList.add('wrong');

        score = Math.max(0, score - 10); // 실패 시 점수 감소
        updateStats();

        setTimeout(() => {
            gameBoard.children[first.index].classList.remove('flipped', 'wrong');
            gameBoard.children[second.index].classList.remove('flipped', 'wrong');
            gameBoard.children[first.index].textContent = '?';
            gameBoard.children[second.index].textContent = '?';

            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

// 진행 상황 업데이트
function updateProgress() {
    const config = difficulties[currentDifficulty];
    const matchedCards = matchedPairs * 2;
    const totalCards = config.totalCards;
    const percentage = (matchedCards / totalCards) * 100;

    progressElement.textContent = `${matchedCards}/${totalCards}`;
    progressBar.style.width = `${percentage}%`;
}

// 통계 업데이트
function updateStats() {
    movesElement.textContent = moves;
    scoreElement.textContent = score;

    // 정확도 계산
    const config = difficulties[currentDifficulty];
    const perfectMoves = config.pairs; // 완벽한 경우 필요한 이동 횟수
    const accuracy = moves === 0 ? 100 : Math.min(100, Math.round((perfectMoves / moves) * 100));
    accuracyElement.textContent = `${accuracy}%`;
}

// 타이머 시작
function startTimer() {
    timerInterval = setInterval(() => {
        if (!isPaused) {
            const elapsed = Date.now() - startTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;

            timerElement.textContent =
                `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

            // 시간에 따른 점수 감소 (10초마다 1점)
            if (seconds > 0 && seconds % 10 === 0) {
                score = Math.max(0, score - 1);
                updateStats();
            }
        }
    }, 100);
}

// 타이머 정지
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 일시정지 토글
function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        pauseBtn.textContent = '▶️ 계속하기';
        showModal(pauseModal);
    } else {
        pauseBtn.textContent = '⏸️ 일시정지';
        closeModal(pauseModal);
    }
}

// 게임 종료
function endGame() {
    stopTimer();

    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // 시간 보너스 계산
    const config = difficulties[currentDifficulty];
    const timeBonus = Math.max(0, 500 - seconds * 2);
    const finalScore = score + timeBonus;

    // 정확도 계산
    const perfectMoves = config.pairs;
    const accuracy = Math.min(100, Math.round((perfectMoves / moves) * 100));

    // 모달에 결과 표시
    document.getElementById('modalTime').textContent = timeString;
    document.getElementById('modalMoves').textContent = moves;
    document.getElementById('modalAccuracy').textContent = `${accuracy}%`;
    document.getElementById('modalScore').textContent = finalScore;

    // 업적 메시지
    const achievementElement = document.getElementById('modalAchievement');
    let achievementText = '';

    if (accuracy === 100) {
        achievementText = '🏆 완벽해요! 모든 시도가 정확했습니다!';
    } else if (accuracy >= 80) {
        achievementText = '🌟 훌륭해요! 거의 완벽한 플레이입니다!';
    } else if (accuracy >= 60) {
        achievementText = '👍 잘했어요! 계속 연습하면 더 좋아질 거예요!';
    } else {
        achievementText = '💪 좋은 시작이에요! 다시 도전해보세요!';
    }

    if (achievementElement) {
        achievementElement.textContent = achievementText;
    }

    // 최고 기록 업데이트
    const bestScoreKey = `bestScore_${currentDifficulty}`;
    const currentBest = localStorage.getItem(bestScoreKey);

    if (!currentBest || finalScore > parseInt(currentBest)) {
        localStorage.setItem(bestScoreKey, finalScore);
        if (achievementElement) {
            achievementElement.textContent = '🎉 새로운 최고 기록입니다! ' + achievementText;
        }
    }

    // 모달 표시
    showModal(completionModal);
}

// 모달 표시
function showModal(modal) {
    modal.classList.add('show');
}

// 모달 닫기
function closeModal(modal) {
    modal.classList.remove('show');
}

// 포맷된 시간 가져오기
function getFormattedTime() {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
