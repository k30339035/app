# 🚀 Space Drone Wars 2026 - 우주 드론 대전

> 2026년 최신 게임 트렌드를 반영한 차세대 브라우저 기반 우주 전투 시뮬레이터

![Game Status](https://img.shields.io/badge/status-playable-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/Canvas_2D-FF6B6B?logo=html5&logoColor=white)

## 📋 게임 소개

**Space Drone Wars**는 2026년 게임 산업의 최신 트렌드를 모두 반영한 차세대 우주 전투 게임입니다. AI 기반 적 드론, 실시간 물리 엔진, 화려한 파티클 시스템, 멀티플레이어 지원 등 현대 게임 개발의 핵심 기술을 브라우저에서 경험할 수 있습니다.

### 🎯 게임 특징

#### 🤖 AI-Powered 적 드론 시스템
- **스마트 행동 트리**: 순찰(Patrol) → 추격(Pursue) → 전투(Combat) 상태 전환
- **동적 난이도 조절**: 웨이브가 진행될수록 더 강력하고 똑똑한 적 등장
- **예측 조준 시스템**: 적 AI가 플레이어의 움직임을 예측하여 조준
- **회피 기동**: 랜덤 회피 패턴으로 피격 확률 감소

#### ⚡ 실시간 물리 엔진
- **벡터 기반 움직임**: 현실적인 관성과 가속도 시뮬레이션
- **충돌 감지 시스템**: 정밀한 원형 충돌 감지 (Circle Collision)
- **경계 순환**: 화면 가장자리를 넘어가면 반대편에서 등장
- **마찰력 시뮬레이션**: 자연스러운 감속 효과

#### 🎨 고급 그래픽 & 이펙트
- **파티클 시스템**:
  - 폭발 효과 (최대 50개 파티클)
  - 추진기 이펙트 (실시간 생성)
  - 알파 블렌딩 및 발광 효과
- **레이저 트레일**: 그라디언트 기반 레이저 궤적
- **별 배경**: 200개의 반짝이는 별들로 우주 분위기 연출
- **글로우 효과**: 모든 오브젝트에 네온 발광 효과

#### 👥 멀티플레이어 지원
- **로컬 2인 협동 플레이**: 한 화면에서 두 명이 함께 플레이
- **독립적인 조작 시스템**:
  - 플레이어 1: WASD/화살표 + Space/마우스
  - 플레이어 2: IJKL + Enter
- **개별 점수 추적**: 각 플레이어의 격추 수와 점수 기록

#### 🌊 웨이브 시스템
- **무한 웨이브**: 끝없이 이어지는 적의 공격
- **난이도 증가**: 웨이브마다 적의 수와 강도 증가
- **보스 웨이브**: 특정 웨이브에서 강력한 적 등장
- **준비 시간**: 각 웨이브 사이 5초 휴식

#### 💾 진행 상황 저장
- **로컬 스토리지 활용**: 브라우저에 통계 자동 저장
- **통계 추적**:
  - 최고 점수
  - 총 격추 수
  - 플레이 시간

## 🎮 조작법

### 플레이어 1
- **이동**: `W` `A` `S` `D` 또는 방향키
- **발사**: `Space` 또는 마우스 클릭
- **마우스 조준**: 마우스 위치를 향해 자동 조준

### 플레이어 2 (멀티플레이어 모드)
- **이동**: `I` `J` `K` `L`
- **발사**: `Enter`

### 공통
- **일시정지**: `ESC` 또는 `P`

## 🛠️ 기술 스택

### 핵심 기술
```
├── HTML5 Canvas 2D        # 렌더링 엔진
├── JavaScript ES6+        # 게임 로직
├── CSS3 Animations        # UI 애니메이션
└── Local Storage API      # 데이터 저장
```

### 게임 아키텍처
```
Game
├── Vector2D               # 2D 벡터 수학
├── ParticleSystem         # 파티클 효과 관리
│   └── Particle          # 개별 파티클
├── Drone (Base Class)     # 드론 기본 클래스
│   ├── PlayerDrone       # 플레이어 제어
│   └── EnemyDrone        # AI 제어
├── Projectile            # 발사체
├── InputManager          # 입력 처리
├── StarField             # 배경 효과
└── Game                  # 메인 게임 루프
```

## 🌟 2026 게임 트렌드 적용

### 1. 🤖 AI 기술 혁명
- **적용**: 고급 AI 행동 트리로 스마트한 적 드론 구현
- **트렌드**: 97%의 개발자가 AI를 활용하여 개발 가속화

### 2. ☁️ 클라우드 게이밍
- **적용**: 브라우저 기반으로 즉시 플레이 가능, 설치 불필요
- **트렌드**: 2025-2030년 1,207% 성장 예상

### 3. 🎯 크로스 플랫폼
- **적용**: PC, 모바일, 태블릿 모든 디바이스 지원
- **트렌드**: 플랫폼 간 경계가 모호해지는 중

### 4. 🎨 실시간 물리 시뮬레이션
- **적용**: 커스텀 물리 엔진과 파티클 시스템
- **트렌드**: 몰입감 있는 실시간 시뮬레이션 중요성 증가

### 5. 👥 멀티플레이어 & 소셜
- **적용**: 로컬 협동 멀티플레이어 지원
- **트렌드**: 사용자 생성 콘텐츠와 소셜 기능 핵심

## 🚀 실행 방법

### 방법 1: 직접 실행
```bash
# 저장소 클론
git clone <repository-url>
cd app

# 브라우저에서 index.html 열기
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### 방법 2: 로컬 서버
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# 브라우저에서 http://localhost:8000 접속
```

## 📊 게임 시스템 상세

### 난이도 시스템
| 웨이브 | 적 수 | 적 난이도 | 적 체력 | 점수 |
|--------|-------|-----------|---------|------|
| 1-2    | 3-5   | 1         | 70      | 100  |
| 3-5    | 6-9   | 2         | 90      | 200  |
| 6-8    | 10-13 | 3         | 110     | 300  |
| 9+     | 14+   | 4-5       | 130+    | 400+ |

### 무기 시스템
- **레이저**: 기본 무기, 무한 탄약
- **발사 속도**: 초당 5발
- **데미지**: 20
- **속도**: 600 px/s
- **사거리**: 3초 비행 시간

### 체력 시스템
- **플레이어**: 100 HP
- **피격 데미지**:
  - 적 발사체: 20 HP
  - 충돌: 30 HP
- **적 드론**: 50-130 HP (난이도별)

## 🎨 커스터마이징

### 색상 테마 변경
```javascript
// game.js에서 색상 변경
const colors = ['#00d4ff', '#ff00ff']; // 플레이어 색상
```

### 난이도 조절
```javascript
// game.js에서 난이도 파라미터 조절
this.enemiesPerWave = 5;  // 웨이브당 적 수
this.waveDelay = 3;       // 웨이브 간 대기 시간
```

## 🐛 알려진 이슈

- 모바일 터치 조작은 향후 업데이트 예정
- 사운드 효과는 향후 추가 예정
- 온라인 멀티플레이어는 향후 계획

## 🔮 향후 계획

- [ ] 사운드 및 배경음악
- [ ] 모바일 터치 조작
- [ ] 추가 무기 시스템 (미사일, 레일건 등)
- [ ] 파워업 아이템
- [ ] 업그레이드 시스템
- [ ] 글로벌 리더보드
- [ ] 온라인 멀티플레이어
- [ ] 커스텀 스킨 시스템

## 📚 참고 자료

### 2026 게임 트렌드 출처
- [BCG Video Gaming Report 2026](https://www.bcg.com/publications/2025/video-gaming-report-2026-next-era-of-growth)
- [SpeeQual Games: Future of Game Development](https://speequalgames.com/the-future-of-game-developments/)
- [N-iX Gaming Industry Trends](https://gamestudio.n-ix.com/the-gaming-industry-trends/)
- [Globant Gaming 2026 Report](https://www.globant.com/news/globant-report-gaming-2026-game-on)

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🤝 기여하기

버그 리포트, 기능 제안, Pull Request 환영합니다!

---

**Made with ❤️ using 2026 Gaming Trends**

즐거운 게임 되세요! 🎮🚀
