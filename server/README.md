# 정글북 예약 시스템 서버

## 설정 방법

### 1. GitHub OAuth 앱 설정

1. GitHub에서 새로운 OAuth 앱을 생성합니다:
   - GitHub.com → Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: `Junglebook Reservation`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:4000/auth/github/callback`

2. 생성된 Client ID와 Client Secret을 복사해두세요.

### 2. 환경 변수 설정

#### 방법 1: 배치 파일 사용 (권장)
1. `start.bat` 파일을 편집하여 실제 Client ID와 Secret을 입력:
   ```cmd
   set GITHUB_CLIENT_ID=실제_클라이언트_ID
   set GITHUB_CLIENT_SECRET=실제_클라이언트_시크릿
   ```
2. 배치 파일로 서버 시작:
   ```cmd
   start.bat
   ```

#### 방법 2: 명령줄에서 직접 설정

**Windows (CMD):**
```cmd
set GITHUB_CLIENT_ID=your_client_id_here
set GITHUB_CLIENT_SECRET=your_client_secret_here
node server.js
```

**Windows (PowerShell):**
```powershell
$env:GITHUB_CLIENT_ID="your_client_id_here"
$env:GITHUB_CLIENT_SECRET="your_client_secret_here"
node server.js
```

**macOS/Linux:**
```bash
export GITHUB_CLIENT_ID=your_client_id_here
export GITHUB_CLIENT_SECRET=your_client_secret_here
node server.js
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 서버 실행

```bash
cd server 
start.bat
```

서버는 `http://localhost:4000`에서 실행됩니다.

## API 엔드포인트

- `GET /auth/status` - 로그인 상태 확인
- `POST /auth/logout` - 로그아웃
- `GET /auth/github` - GitHub OAuth 로그인 시작
- `GET /auth/github/callback` - GitHub OAuth 콜백
- `GET /api/reservations` - 예약 목록 조회
- `POST /api/reservations` - 예약 생성

## 문제 해결

### GitHub OAuth 오류가 발생하는 경우:
1. 환경 변수가 제대로 설정되었는지 확인
2. GitHub OAuth 앱의 callback URL이 정확한지 확인
3. 서버를 재시작하여 환경 변수 적용
4. `start.bat` 파일을 사용하여 환경 변수 설정 확인

### 세션 관련 오류가 발생하는 경우:
1. 브라우저 쿠키가 활성화되어 있는지 확인
2. 개발자 도구에서 쿠키 설정 확인

### 404 에러가 발생하는 경우:
1. 서버가 실행 중인지 확인
2. 포트 4000이 사용 가능한지 확인
3. 모든 Node.js 프로세스를 종료하고 다시 시작
