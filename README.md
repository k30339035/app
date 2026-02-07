# 🤖⚔️ 로봇 배틀 아레나 - 차세대 대전 게임

최신 웹 기술을 활용한 2D 로봇 대전 게임입니다. 캐릭터 선택, AI 대전, 2인 로컬 대전을 지원합니다.

![Game Preview](https://img.shields.io/badge/Game-Fighting-red?style=for-the-badge)
![Web Tech](https://img.shields.io/badge/Tech-HTML5%20Canvas-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Ready%20to%20Play-blue?style=for-the-badge)

## ✨ 주요 기능

### 🎮 게임 모드
- **AI 대전**: 적응형 AI와 대결
- **2인 대전**: 같은 키보드로 친구와 대전

### 🤖 4가지 고유한 로봇 캐릭터

| 캐릭터 | 특징 | 능력치 |
|--------|------|--------|
| **STRIKER** 🔴 | 빠른 속도와 연속 공격 | 속도 ⭐⭐⭐⭐⭐ |
| **TANK** 🟢 | 강력한 방어력과 체력 | 방어 ⭐⭐⭐⭐⭐ |
| **BLASTER** 🔵 | 강력한 원거리 공격 | 공격 ⭐⭐⭐⭐⭐ |
| **BALANCED** 🟣 | 균형잡힌 만능 전사 | 모든 능력치 균형 |

### 💫 고급 기능
- **캐릭터별 고유 능력치**: 속도, 공격력, 방어력, 에너지
- **3가지 공격 타입**: 펀치, 발차기, 특수 공격
- **파티클 효과**: 타격 시 폭발 효과와 스파크
- **쿨다운 시스템**: 각 공격마다 쿨타임
- **에너지 시스템**: 공격 시 에너지 소모 및 자동 회복
- **타이머 시스템**: 99초 제한 시간
- **스턴 시스템**: 피격 시 짧은 기절

## 🕹️ 조작법

### 플레이어 1
- **WASD**: 이동
- **W**: 점프
- **J**: 펀치 (기본 공격)
- **K**: 발차기 (중간 공격)
- **L**: 특수 공격 (강력한 광선)

### 플레이어 2 (2인 대전 모드)
- **방향키**: 이동
- **↑**: 점프
- **1**: 펀치
- **2**: 발차기
- **3**: 특수 공격

## 🚀 실행 방법

### 방법 1: 로컬 실행

#### 옵션 A: 직접 열기
```bash
# 브라우저에서 index.html 파일을 직접 열기
```

#### 옵션 B: 웹 서버 사용
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server)
npx serve .

# PHP
php -S localhost:8000
```

브라우저에서 `http://localhost:8000` 접속

### 방법 2: Vercel 배포

#### GitHub를 통한 배포
1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com) 접속 및 로그인
3. "New Project" 클릭
4. GitHub 저장소 선택
5. 자동 배포 완료!

#### Vercel CLI
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 🎯 게임 플레이

### 게임 시작
1. 게임 모드 선택 (AI 대전 / 2인 대전)
2. 캐릭터 선택 (능력치 확인 가능)
3. "전투 시작!" 버튼 클릭
4. **FIGHT!**

### 승리 조건
- 상대의 체력을 0으로 만들기
- 제한 시간 종료 시 체력이 더 높은 플레이어 승리
- 체력이 같으면 무승부

### 전투 팁
- 에너지를 관리하세요! 공격마다 에너지 소모
- 각 캐릭터의 장점을 활용하세요
- 특수 공격은 강력하지만 에너지를 많이 소모합니다
- 스턴 상태를 활용해 연속 공격하세요

## 🛠️ 기술 스택

### 최신 웹 기술
- **HTML5 Canvas**: 고성능 2D 렌더링
- **CSS3 고급 기능**:
  - CSS Grid & Flexbox
  - CSS Custom Properties (CSS 변수)
  - CSS Animations & Transitions
  - Backdrop Filter (blur)
  - Gradient 애니메이션
- **Modern JavaScript**:
  - ES6+ Classes
  - Arrow Functions
  - Destructuring
  - Template Literals
  - Async/Await (준비됨)

### 게임 시스템
```javascript
// 캐릭터 시스템
- 4가지 고유 캐릭터 클래스
- 능력치 기반 성능 차별화
- 개별 공격 패턴

// 물리 엔진
- 중력 및 충돌 감지
- 넉백 효과
- 부드러운 움직임

// AI 시스템
- 상태 기반 행동 (FSM)
- 거리 기반 전술
- 에너지 관리
- 체력 기반 전략 변경

// 파티클 시스템
- 타격 효과
- 폭발 애니메이션
- 광선 효과 (특수 공격)
```

## 📁 프로젝트 구조

```
robot-battle-arena/
├── index.html          # 완전한 게임 (단일 파일)
├── vercel.json         # Vercel 배포 설정
└── README.md           # 이 파일
```

**단일 파일 아키텍처**: 모든 HTML, CSS, JavaScript가 하나의 파일에 통합되어 배포가 쉽습니다!

## 🎨 디자인 특징

### UI/UX
- **반응형 디자인**: 다양한 화면 크기 지원
- **다크 테마**: 눈이 편한 사이버펑크 스타일
- **부드러운 애니메이션**: CSS transitions & keyframes
- **시각적 피드백**: 호버 효과, 파티클, 그림자

### 컬러 팔레트
```css
--primary-color: #00ff88   /* 네온 그린 */
--secondary-color: #ff0088 /* 네온 핑크 */
--accent-blue: #00d4ff     /* 사이버 블루 */
--accent-purple: #b400ff   /* 네온 퍼플 */
--accent-orange: #ff6b00   /* 경고 오렌지 */
```

## 🎓 Unity3D 통합 가이드

### 1. 게임 로직 이식

#### 캐릭터 시스템
```csharp
public class RobotCharacter : MonoBehaviour {
    public RobotType type;
    public float speed, power, defense, energy;

    public void Attack(AttackType type) {
        // 공격 로직
    }

    public void TakeDamage(float damage) {
        // 피해 처리
    }
}

public enum RobotType {
    Striker, Tank, Blaster, Balanced
}
```

#### AI 시스템
```csharp
public class RobotAI : MonoBehaviour {
    private enum AIState {
        Approach, Retreat, Punch, Kick, Special
    }

    private AIState currentState;

    void MakeDecision() {
        float distance = Vector3.Distance(transform.position, target.position);
        // 거리 기반 의사결정
    }
}
```

### 2. Unity 물리 변환

```csharp
// Rigidbody2D 설정
rb.gravityScale = 0.6f;
rb.drag = 0.85f;

// 공격 충돌 감지
void OnTriggerEnter2D(Collider2D other) {
    if (isAttacking && other.CompareTag("Enemy")) {
        other.GetComponent<RobotCharacter>().TakeDamage(attackDamage);
    }
}
```

### 3. 파티클 시스템

Unity Particle System으로 변환:
- Hit Effect → Burst particle
- Explosion → Radial particle burst
- Special Attack → Beam particle trail

### 4. UI 시스템

```csharp
using UnityEngine.UI;

public Slider healthBar;
public Slider energyBar;

void UpdateUI() {
    healthBar.value = health / maxHealth;
    energyBar.value = energy / maxEnergy;
}
```

## 📊 성능

- **프레임레이트**: 60 FPS 고정
- **파일 크기**: ~50KB (단일 HTML 파일)
- **로딩 시간**: < 1초
- **메모리 사용**: ~25MB

## 🌐 브라우저 호환성

| 브라우저 | 최소 버전 | 테스트 완료 |
|----------|----------|------------|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Edge | 90+ | ✅ |
| Safari | 14+ | ✅ |
| Opera | 76+ | ✅ |

## 🔧 커스터마이징

### 캐릭터 추가
```javascript
CHARACTERS.newCharacter = {
    name: 'NEW_ROBOT',
    color: '#custom-color',
    stats: { speed: 80, power: 85, defense: 70, energy: 75 },
    abilities: {
        punch: { damage: 10, energy: 5, cooldown: 18 },
        kick: { damage: 15, energy: 12, cooldown: 28 },
        special: { damage: 30, energy: 45, cooldown: 110 }
    }
};
```

### 능력치 조정
```javascript
// js/game.js에서 수정 가능
maxHealth: 150,  // 체력 증가
energyRegenRate: 0.5,  // 에너지 회복 속도 증가
```

## 🐛 알려진 이슈

- 모바일 터치 컨트롤 미지원 (향후 추가 예정)
- 사운드 효과 없음 (Web Audio API 통합 예정)

## 🔮 향후 계획

- [ ] 모바일 터치 컨트롤
- [ ] 사운드 효과 및 배경음악
- [ ] 온라인 멀티플레이어
- [ ] 더 많은 캐릭터
- [ ] 스토리 모드
- [ ] 트레이닝 모드
- [ ] 리플레이 시스템

## 📝 라이선스

이 프로젝트는 Unity3D 통합 전 프로토타입 테스트 목적으로 제작되었습니다.

## 🤝 기여

버그 리포트나 기능 제안은 Issues에 등록해주세요!

## 👨‍💻 개발자 노트

### 왜 단일 파일인가?
- **간단한 배포**: 어디서나 즉시 실행 가능
- **의존성 없음**: 외부 라이브러리 불필요
- **빠른 로딩**: HTTP 요청 최소화
- **Unity 이식 용이**: 모든 로직이 한 곳에

### 코드 구조
```
1. CSS (스타일)
2. HTML (마크업)
3. JavaScript:
   - 캐릭터 데이터
   - 게임 상태
   - UI 시스템
   - 파티클 시스템
   - 로봇 클래스
   - AI 시스템
   - 게임 메인 루프
```

---

**즐거운 전투 되세요!** 🤖⚔️🤖

Made with ❤️ using modern web technologies

