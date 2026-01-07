# 사운드 MP3 변환 가이드

이 문서는 게임에서 생성된 사운드를 Unity3D에서 사용할 수 있도록 MP3 형식으로 변환하는 방법을 설명합니다.

## 방법 1: 사운드 내보내기 도구 사용 (권장)

1. **sound-export.html 열기**
   ```
   브라우저에서 sound-export.html 파일을 엽니다.
   ```

2. **WAV 파일 다운로드**
   - 각 사운드의 "Download WAV" 버튼을 클릭
   - 또는 "Download All Sounds" 버튼으로 모든 사운드를 한번에 다운로드

3. **WAV를 MP3로 변환** (아래 방법 중 선택)

## 방법 2: FFmpeg 사용 (가장 권장)

### 설치

**Windows:**
```bash
# Chocolatey 사용
choco install ffmpeg

# 또는 https://ffmpeg.org/download.html 에서 다운로드
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg  # Ubuntu/Debian
sudo yum install ffmpeg      # CentOS/RHEL
```

### 변환 명령어

**단일 파일 변환:**
```bash
ffmpeg -i punch.wav -codec:a libmp3lame -qscale:a 2 punch.mp3
```

**배치 변환 (모든 WAV 파일):**

**Windows (PowerShell):**
```powershell
Get-ChildItem *.wav | ForEach-Object {
    ffmpeg -i $_.Name -codec:a libmp3lame -qscale:a 2 ($_.BaseName + ".mp3")
}
```

**macOS/Linux (Bash):**
```bash
for file in *.wav; do
    ffmpeg -i "$file" -codec:a libmp3lame -qscale:a 2 "${file%.wav}.mp3"
done
```

### 품질 설정

- `-qscale:a 0` - 최고 품질 (320kbps)
- `-qscale:a 2` - 고품질 (190kbps) - **권장**
- `-qscale:a 4` - 중간 품질 (165kbps)
- `-qscale:a 6` - 낮은 품질 (130kbps)

## 방법 3: Audacity 사용

1. **Audacity 설치**
   - https://www.audacityteam.org/ 에서 다운로드

2. **LAME MP3 인코더 설치** (필요시)
   - Audacity → Edit → Preferences → Libraries
   - "Download LAME" 클릭하여 설치

3. **변환 과정**
   - File → Open → WAV 파일 선택
   - File → Export → Export as MP3
   - 품질 설정: 192 kbps 권장
   - Export 클릭

## 방법 4: 온라인 변환기 사용

### 추천 사이트

1. **CloudConvert** (https://cloudconvert.com/wav-to-mp3)
   - 장점: 고품질, 배치 변환 지원
   - 단점: 파일 크기 제한

2. **Online Audio Converter** (https://online-audio-converter.com/)
   - 장점: 간단한 인터페이스
   - 품질 설정 가능

3. **FreeConvert** (https://www.freeconvert.com/wav-to-mp3)
   - 장점: 여러 파일 동시 변환
   - 품질 커스터마이징 가능

### 사용 방법
1. 사이트 접속
2. WAV 파일 업로드
3. 출력 품질 설정 (192-256 kbps 권장)
4. 변환 시작
5. MP3 파일 다운로드

## 방법 5: Node.js 스크립트 사용

### 사전 요구사항
```bash
npm install fluent-ffmpeg
```

### 스크립트 작성 (convert-sounds.js)
```javascript
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const soundsDir = './assets/sounds';
const wavFiles = fs.readdirSync(soundsDir).filter(f => f.endsWith('.wav'));

wavFiles.forEach(file => {
    const input = path.join(soundsDir, file);
    const output = path.join(soundsDir, file.replace('.wav', '.mp3'));

    ffmpeg(input)
        .audioBitrate(192)
        .audioQuality(2)
        .toFormat('mp3')
        .on('end', () => console.log(`✓ ${file} converted`))
        .on('error', (err) => console.error(`✗ ${file} error:`, err))
        .save(output);
});
```

### 실행
```bash
node convert-sounds.js
```

## Unity3D에서 사용하기

### 1. MP3 파일 임포트

1. Unity 프로젝트의 `Assets/Sounds/` 폴더에 MP3 파일 복사
2. Unity에서 자동으로 임포트됨

### 2. 오디오 클립 설정

각 MP3 파일 선택 후 Inspector에서:

```
Load Type: Decompress On Load (짧은 효과음)
Preload Audio Data: ✓
Compression Format: Vorbis
Quality: 70-100 (권장: 80)

3D Sound Settings:
- Spatial Blend: 1.0 (완전한 3D)
- Volume Rolloff: Logarithmic
- Min Distance: 1
- Max Distance: 500
```

### 3. AudioSource 컴포넌트 설정

```csharp
AudioSource audioSource = GetComponent<AudioSource>();
audioSource.clip = punchSound; // MP3 파일
audioSource.spatialBlend = 1.0f; // 3D 사운드
audioSource.rolloffMode = AudioRolloffMode.Logarithmic;
audioSource.minDistance = 1f;
audioSource.maxDistance = 500f;
audioSource.Play();
```

## 사운드 파일 목록

변환해야 할 사운드 파일들:

1. `punch.wav` → `punch.mp3` - 펀치 타격음
2. `hit.wav` → `hit.mp3` - 충격음
3. `explosion.wav` → `explosion.mp3` - 폭발음
4. `laser.wav` → `laser.mp3` - 레이저 발사음
5. `jump.wav` → `jump.mp3` - 점프음
6. `footstep.wav` → `footstep.mp3` - 발소리
7. `powerup.wav` → `powerup.mp3` - 파워업음
8. `damage.wav` → `damage.mp3` - 피격음
9. `shield.wav` → `shield.mp3` - 방어막음
10. `charge.wav` → `charge.mp3` - 차징음

## 품질 권장사항

### 효과음 (0.1~0.5초)
- 비트레이트: 128-192 kbps
- 샘플레이트: 44.1 kHz
- 채널: Mono (파일 크기 절감)

### 폭발/임팩트 (0.5~1초)
- 비트레이트: 192-256 kbps
- 샘플레이트: 44.1 kHz
- 채널: Stereo (더 풍부한 사운드)

### 차징 사운드 (1초+)
- 비트레이트: 192 kbps
- 샘플레이트: 44.1 kHz
- 채널: Stereo

## 파일 크기 최적화

### 모노 변환 (파일 크기 50% 절감)
```bash
ffmpeg -i punch.wav -ac 1 -codec:a libmp3lame -qscale:a 2 punch.mp3
```

### 샘플레이트 조정
```bash
ffmpeg -i punch.wav -ar 22050 -codec:a libmp3lame -qscale:a 2 punch.mp3
```

## 문제 해결

### "LAME not found" 오류
- FFmpeg를 LAME 인코더 포함 버전으로 재설치

### 음질이 떨어짐
- `-qscale:a` 값을 0~2로 설정
- 또는 `-b:a 256k` 사용 (고정 비트레이트)

### 파일이 너무 큼
- 모노 변환 사용 (`-ac 1`)
- 샘플레이트 낮추기 (`-ar 22050`)
- 비트레이트 조정 (`-b:a 128k`)

## 자동화 스크립트

### Bash 스크립트 (export-all.sh)
```bash
#!/bin/bash

# 사운드 내보내기 디렉토리 생성
mkdir -p assets/sounds

# WAV를 MP3로 변환
for sound in punch hit explosion laser jump footstep powerup damage shield charge; do
    echo "Converting $sound..."
    ffmpeg -i "${sound}.wav" -codec:a libmp3lame -qscale:a 2 "assets/sounds/${sound}.mp3"
done

echo "All sounds converted to MP3!"
```

### 실행 권한 부여 및 실행
```bash
chmod +x export-all.sh
./export-all.sh
```

---

## 추가 리소스

- [FFmpeg 공식 문서](https://ffmpeg.org/documentation.html)
- [Unity Audio 최적화 가이드](https://docs.unity3d.com/Manual/class-AudioClip.html)
- [Web Audio API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**질문이나 문제가 있으시면 이슈를 등록해주세요!**
