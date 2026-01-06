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

// 게임 상태 변수
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let canFlip = true;
let currentWords = [];

// DOM 요소
const gameBoard = document.getElementById('gameBoard');
const progressElement = document.getElementById('progress');
const messageElement = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');

// 게임 초기화
function initGame() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    canFlip = true;
    messageElement.textContent = '';
    messageElement.className = 'message';

    // 랜덤으로 6개의 단어 쌍 선택
    currentWords = getRandomWords(6);

    // 카드 생성 (6개 영어 + 6개 한글 = 12개)
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

// 배열 섞기 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 게임 보드 렌더링
function renderBoard() {
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
    if (!canFlip) return;

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
            updateProgress();

            flippedCards = [];
            canFlip = true;

            // 모든 카드가 매칭되었는지 확인
            if (matchedPairs === 6) {
                setTimeout(() => {
                    messageElement.textContent = '축하합니다! 모든 단어를 매칭했습니다! 🎉';
                    messageElement.className = 'message success';
                }, 300);
            }
        }, 500);
    } else {
        // 매칭 실패
        setTimeout(() => {
            gameBoard.children[first.index].classList.remove('flipped');
            gameBoard.children[second.index].classList.remove('flipped');
            gameBoard.children[first.index].textContent = '?';
            gameBoard.children[second.index].textContent = '?';

            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

// 진행 상황 업데이트
function updateProgress() {
    const matchedCards = matchedPairs * 2; // 각 쌍마다 2개의 카드
    progressElement.textContent = `${matchedCards}/12`;
}

// 새 게임 시작
resetBtn.addEventListener('click', () => {
    initGame();
});

// 페이지 로드 시 게임 초기화
window.addEventListener('load', () => {
    initGame();
});
