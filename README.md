# 🤖 로봇 배틀 아레나 - AI 전투 게임

Unity3D 적용 전 테스트용 로봇 대전 게임입니다. HTML5 Canvas와 JavaScript로 제작되었습니다.

## 🎮 게임 특징

- **AI 전투 시스템**: 적응형 AI가 플레이어의 패턴을 학습하고 대응합니다
- **물리 엔진**: 중력, 마찰, 충돌 감지가 구현되어 있습니다
- **파티클 효과**: 타격 시 시각적 피드백을 제공합니다
- **에너지 시스템**: 공격과 점프에 에너지가 소모됩니다
- **라운드 시스템**: 적을 처치하면 다음 라운드로 진행됩니다

## 🕹️ 조작법

- **WASD**: 이동
- **Space**: 점프
- **좌클릭**: 근접 공격 (펀치)
- **우클릭**: 원거리 공격 (에너지 블래스트)

## 🚀 실행 방법

### 방법 1: 로컬에서 실행

1. **Python 웹 서버 사용**
```bash
python -m http.server 8000
```
브라우저에서 `http://localhost:8000` 접속

2. **직접 열기**
`index.html` 파일을 최신 브라우저(Chrome, Firefox, Edge 권장)에서 직접 열기

### 방법 2: Vercel에 배포

1. **Vercel CLI 설치**
```bash
npm install -g vercel
```

2. **배포**
```bash
vercel
```

또는 Vercel 웹 인터페이스에서:
1. GitHub 저장소 연결
2. 자동으로 배포됨

## 📁 프로젝트 구조

```
robot-battle-game/
├── index.html          # 전체 게임 (CSS + JavaScript 포함)
├── vercel.json         # Vercel 배포 설정
└── README.md           # 이 파일
```

## 🎯 게임 시스템

### 물리 엔진
- 중력: 0.5
- 마찰: 0.85
- 충돌 감지 및 반응

### 전투 시스템
- 근접 공격: 10 데미지, 5 에너지 소모
- 원거리 공격: 15 데미지, 15 에너지 소모
- 에너지 자동 회복: 초당 12

### AI 행동
- **접근**: 플레이어와 거리가 멀 때
- **후퇴**: 체력이 30% 이하일 때
- **공격**: 근거리에서 공격 시도
- **사격**: 중거리에서 에너지 블래스트 발사

## 🎨 기술 스택

- **HTML5 Canvas**: 그래픽 렌더링
- **JavaScript ES6+**: 게임 로직
- **CSS3**: UI 스타일링

## 🔧 Unity3D 통합 가이드

### 1. 게임 로직 이식

이 프로토타입의 주요 클래스들을 Unity C# 스크립트로 변환:

**PhysicsEngine** → Unity의 `Rigidbody2D` 사용
```csharp
Rigidbody2D rb = GetComponent<Rigidbody2D>();
rb.gravityScale = 0.5f;
rb.drag = 0.15f;
```

**Robot** → `MonoBehaviour` 클래스로 변환
```csharp
public class Robot : MonoBehaviour {
    public float maxHealth = 100f;
    public float health = 100f;
    public float moveSpeed = 5f;
    // ...
}
```

**CombatAI** → Unity AI 스크립트
```csharp
public class CombatAI : MonoBehaviour {
    private enum AIState { Approach, Retreat, Attack, Shoot }
    private AIState currentState;
    // ...
}
```

### 2. 물리 설정

Unity Physics2D 설정:
- Gravity Scale: 0.5
- Linear Drag: 0.85
- Collision Detection: Continuous

### 3. 파티클 효과

Unity Particle System으로 변환:
```csharp
ParticleSystem hitEffect;
hitEffect.Play();
```

### 4. UI 시스템

Unity UI (Canvas) 사용:
```csharp
using UnityEngine.UI;

public Slider healthBar;
healthBar.value = health / maxHealth;
```

## 📊 성능

- **프레임레이트**: 60 FPS 고정
- **파티클 제한**: 동시 500개
- **메모리**: 약 20MB

## 🌐 브라우저 호환성

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## 📝 라이선스

이 프로젝트는 Unity3D 프로토타입 테스트 목적으로 제작되었습니다.

## 🐛 버그 리포트

이슈가 있으시면 GitHub Issues에 등록해주세요.

---

**즐거운 게임 되세요!** 🎮🤖
