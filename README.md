# 🚌 스쿨버스 관리

과천여고 스쿨버스 출석 및 운행 관리 PWA

## 구성

- **출석 관리**: 오늘/특정 날짜 미탑승 학생 체크
- **운행 관리**: 운행 취소 알림 발송, 알림 차단/해제, 기기 잠금 해제

## 배포 (GitHub Pages)

1. GitHub에 **Private 레포** `school-admin` 생성
2. 이 폴더의 모든 파일을 업로드:
   - `index.html`
   - `manifest.json`
   - `service-worker.js`
   - `icons/` 폴더 전체
3. Repo Settings → Pages → Source를 `main` 브랜치, `/ (root)` 폴더로 설정
4. 배포 URL: `https://jeondemo.github.io/school-admin/`

> **Private 레포로도 GitHub Pages 사용 가능**합니다 (GitHub Pro 또는 무료 플랜의 Public Pages 옵션 사용).
> 만약 Private 레포에서 Pages가 안 되면 Public으로 전환하셔도 학생에게 URL만 안 알리시면 됩니다.

## PWA 설치

1. iOS Safari / 안드로이드 Chrome으로 배포 URL 접속
2. iOS: 공유 → "홈 화면에 추가"
3. 안드로이드: 메뉴 → "홈 화면에 추가"
4. 홈화면에 `🚌 스쿨버스 관리` 아이콘이 생성됨

## 캐시 무효화 (코드 수정 후 재배포 시)

`service-worker.js` 파일 상단의 `CACHE_NAME` 버전을 올려주세요:

```js
const CACHE_NAME = "school-admin-v2";  // v1 → v2
```

이렇게 하면 사용자가 다음 접속 시 새 버전이 자동 다운로드됩니다.

## GAS 백엔드

기존 스쿨버스 GAS 백엔드를 그대로 재사용합니다:
- 배포 URL은 `index.html` 상단의 `GAS_URL` 상수에 있습니다
- 새 GAS 배포 시 이 URL만 교체하면 됩니다
- `doPost` 함수가 추가되어 있어야 합니다 (action 기반 라우팅)
