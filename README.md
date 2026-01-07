# Robot Battle Arena - AI Combat Test Game

Unity3D 적용 전 테스트용 로봇 대전 게임입니다. 최신 AI 기술과 사실적인 격투감, 서라운드 사운드 시스템을 구현했습니다.

## 주요 기능

### 1. **AI 전투 시스템**
- **머신러닝 기반 행동 패턴**: 적 AI가 플레이어의 패턴을 학습하고 적응합니다
- **의사결정 트리**: 공격, 방어, 전술적 판단을 동적으로 수행
- **적응형 난이도**: 라운드가 진행될수록 AI의 실력과 공격성이 향상됩니다

### 2. **사실적인 격투 시스템**
- **물리 엔진**: 중력, 마찰, 충돌 감지 및 반응
- **콤보 시스템**: 연속 공격으로 데미지 증가
- **넉백 효과**: 타격 강도에 따른 밀림 효과
- **파티클 효과**: 충격, 폭발, 스파크 등 다양한 시각 효과

### 3. **서라운드 사운드 시스템**
- **Web Audio API 기반 3D 오디오**: HRTF(Head-Related Transfer Function) 사용
- **위치 기반 사운드**: 캐릭터 위치에 따라 소리가 좌우로 이동
- **프로시저럴 사운드 생성**: 실시간으로 생성되는 사운드 효과
- **MP3 내보내기 지원**: 사운드를 파일로 저장하여 Unity에서 재사용 가능

### 4. **무기 시스템**
- **근접 공격**: 펀치, 콤보 시스템
- **원거리 공격**: 에너지 블래스트
- **특수 공격**: 차징 시스템으로 강력한 공격

## 조작 방법

### 키보드
- **W/A/S/D**: 이동
- **Space**: 점프
- **Q**: 회피/대시
- **E**: 특수 공격 차징 (떼면 발사)

### 마우스
- **마우스 이동**: 조준
- **좌클릭**: 근접 공격
- **우클릭**: 원거리 공격

## 실행 방법

### 1. 로컬에서 실행
```bash
# Python 3를 사용한 간단한 웹 서버
python -m http.server 8000

# 또는 Node.js가 설치되어 있다면
npx serve .
```

브라우저에서 `http://localhost:8000` 접속

### 2. 직접 열기
`index.html` 파일을 최신 브라우저(Chrome, Firefox, Edge 권장)에서 직접 열어도 됩니다.

## 기술 스택

- **HTML5 Canvas**: 그래픽 렌더링
- **JavaScript ES6+**: 게임 로직
- **Web Audio API**: 서라운드 사운드 시스템
- **물리 엔진**: 커스텀 2D 물리 시뮬레이션
- **AI 시스템**: 행동 트리 + 강화학습 개념 적용

## 프로젝트 구조

```
robot-battle-game/
├── index.html              # 메인 HTML 파일
├── css/
│   └── game.css           # 스타일시트
├── js/
│   ├── engine/
│   │   ├── game.js        # 메인 게임 엔진
│   │   ├── physics.js     # 물리 엔진
│   │   └── particle.js    # 파티클 시스템
│   ├── entities/
│   │   ├── robot.js       # 로봇 엔티티
│   │   └── weapon.js      # 무기 시스템
│   ├── ai/
│   │   └── combat-ai.js   # AI 전투 시스템
│   └── audio/
│       └── sound-manager.js  # 사운드 매니저
├── assets/
│   └── sounds/            # MP3 사운드 파일 (내보내기 후)
└── README.md
```

## Unity3D 통합 가이드

### 1. 게임 로직 이식
이 프로토타입의 주요 시스템들을 Unity C# 스크립트로 변환:

- **PhysicsEngine** → Unity의 Rigidbody2D 사용
- **Robot** → MonoBehaviour 클래스로 변환
- **CombatAI** → UnityEngine.AI 또는 커스텀 AI 스크립트
- **WeaponSystem** → Unity의 프리팹 시스템 활용

### 2. 사운드 통합
프로시저럴 사운드를 MP3로 내보내는 방법:

#### 방법 1: 브라우저 녹음 도구 사용
1. Chrome/Firefox에서 게임 실행
2. 브라우저 확장 프로그램으로 오디오 녹음 (예: Audacity)
3. 각 사운드 효과를 개별적으로 녹음
4. MP3 형식으로 저장

#### 방법 2: Web Audio API 레코더 추가
`sound-manager.js`에 다음 기능 추가 가능:
- MediaRecorder API를 사용하여 각 사운드를 WAV로 캡처
- FFmpeg 등의 도구로 MP3로 변환

### 3. 파티클 효과
Unity의 Particle System으로 변환:
- `ParticleSystem`의 `createExplosion`, `createImpactSparks` 등을 Unity 파티클 프리팹으로 재구성

### 4. UI 시스템
- Canvas UI를 Unity UI 시스템으로 변환
- TextMeshPro 사용 권장

## 사운드 효과 목록

게임에 포함된 프로시저럴 사운드:

1. **punch** - 펀치 타격음
2. **hit** - 충격음
3. **explosion** - 폭발음
4. **laser** - 레이저 발사음
5. **jump** - 점프음
6. **footstep** - 발소리
7. **powerup** - 파워업음
8. **damage** - 피격음
9. **shield** - 방어막음
10. **charge** - 차징음

모든 사운드는 3D 위치 기반으로 재생되며, HRTF를 통해 서라운드 효과를 제공합니다.

## MP3 사운드 내보내기

### 옵션 1: 수동 녹음
1. 게임 실행
2. 오디오 녹음 소프트웨어 사용 (Audacity, OBS 등)
3. 각 사운드 효과 트리거
4. 녹음 후 MP3로 저장

### 옵션 2: 자동화 스크립트 (개발 중)
```bash
# Node.js 스크립트로 WAV 생성 후 MP3 변환
npm install
npm run export-sounds
```

## 성능 최적화

- **파티클 제한**: 최대 1000개로 제한하여 성능 유지
- **물리 계산 최적화**: deltaTime 기반 프레임 독립적 업데이트
- **사운드 관리**: 동시 재생 사운드 수 제한
- **메모리 관리**: 사용하지 않는 파티클 자동 제거

## 브라우저 호환성

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## 라이선스

이 프로젝트는 Unity3D 프로토타입 테스트 목적으로 제작되었습니다.

## 기여

버그 리포트나 기능 제안은 Issues에 등록해주세요.

## 개발자 노트

### AI 학습 시스템
AI는 다음을 학습합니다:
- 성공한 공격 패턴
- 효과적인 회피 타이밍
- 최적의 교전 거리
- 플레이어의 공격 패턴 예측

### 물리 시스템
- 중력: 0.8
- 마찰: 0.85
- 공기 저항: 0.98
- 충돌 반발 계수: 0.7

### 난이도 조정
라운드마다:
- AI 스킬 레벨 +5%
- AI 공격성 +5%
- 적 체력 +10

---

**즐거운 테스트 되세요!** 🤖⚔️🤖
