const express = require("express");
const passport = require("passport");
const Strategy = require("passport-github2").Strategy;
const cors = require("cors");
const db = require("./config/db");

const app = express();
const port = 4000;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Configure the GitHub strategy for use by Passport.
passport.use(
  new Strategy(
    {
      clientID: process.env["GITHUB_CLIENT_ID"] || "your_github_client_id",
      clientSecret: process.env["GITHUB_CLIENT_SECRET"] || "your_github_client_secret",
      callbackURL: "http://localhost:4000/auth/github/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        console.log("GitHub profile:", profile);
        
        // 사용자 정보를 MySQL에 저장하거나 업데이트
        const userData = {
          github_id: profile.id.toString(),
          user_name: profile.username,
          display_name: profile.displayName || profile.username,
          profile_url: profile.photos?.[0]?.value,
          access_token: accessToken
        };

        // 기존 사용자 확인
        const [existingUsers] = await db.query(
          'SELECT * FROM users WHERE github_id = ?',
          [userData.github_id]
        );

        if (existingUsers.length > 0) {
          // 기존 사용자 정보 업데이트
          await db.query(
            'UPDATE users SET user_name = ?, display_name = ?, profile_url = ?, access_token = ?, updated_at = CURRENT_TIMESTAMP WHERE github_id = ?',
            [userData.user_name, userData.display_name, userData.profile_url, userData.access_token, userData.github_id]
          );
          console.log('기존 사용자 정보 업데이트:', profile.username);
        } else {
          // 새 사용자 등록
          await db.query(
            'INSERT INTO users (github_id, user_name, display_name, profile_url, access_token) VALUES (?, ?, ?, ?, ?)',
            [userData.github_id, userData.user_name, userData.display_name, userData.profile_url, userData.access_token]
          );
          console.log('새 사용자 등록:', profile.username);
        }

        return cb(null, userData);
      } catch (error) {
        console.error('사용자 정보 저장 중 오류:', error);
        return cb(error);
      }
    }
  )
);

// Configure Passport authenticated session persistence.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("cookie-parser")());
app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "junglebook_secret_key",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // 개발환경에서는 false
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
  })
);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      displayName: req.user.display_name || req.user.user_name,
      username: req.user.user_name,
      avatar: req.user.profile_url
    });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

app.post('/auth/logout', (req, res) => {
  // 세션 삭제
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: '로그아웃 실패' });
    }
    res.json({ message: '로그아웃 성공' });
  });
});

// GitHub OAuth Routes
app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "http://localhost:3000/" }),
  function (req, res) {
    res.redirect("http://localhost:3000/");
  }
);

// 사용자 정보 API
app.get('/api/user', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  try {
    const [users] = await db.query(
      'SELECT user_id, github_id, user_name, display_name, profile_url, created_at FROM users WHERE github_id = ?',
      [req.user.github_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 모든 사용자 목록 API (관리자용)
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, github_id, user_name, display_name, profile_url, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 예약 관련 API
app.get('/api/reservations', async (req, res) => {
  try {
    // 오늘 날짜의 예약만 조회
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const [reservations] = await db.query(`
      SELECT r.*, u.user_name, u.display_name, u.profile_url 
      FROM reservations r 
      JOIN users u ON r.user_id = u.user_id 
      WHERE r.slot_time >= ? AND r.slot_time < ?
      ORDER BY r.slot_time ASC
    `, [startOfDay, endOfDay]);
    
    res.json(reservations);
  } catch (error) {
    console.error('예약 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.post('/api/reservations', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  try {
    console.log('예약 요청 받음:', req.body);
    console.log('사용자 정보:', req.user);
    
    const { slot_time } = req.body;
    
    if (!slot_time) {
      return res.status(400).json({ error: 'slot_time이 필요합니다.' });
    }
    
    // 사용자 ID 조회
    const [users] = await db.query(
      'SELECT user_id FROM users WHERE github_id = ?',
      [req.user.github_id]
    );

    console.log('조회된 사용자:', users);

    if (users.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 기존 예약 확인
    const [existingReservations] = await db.query(
      'SELECT * FROM reservations WHERE slot_time = ? AND slot_status = "reserved"',
      [slot_time]
    );

    console.log('기존 예약:', existingReservations);

    if (existingReservations.length > 0) {
      return res.status(409).json({ error: '이미 예약된 시간입니다.' });
    }

    // MySQL DATETIME 형식으로 변환
    const slotDateTime = new Date(slot_time);
    const mysqlDateTime = slotDateTime.toISOString().slice(0, 19).replace('T', ' ');
    
    console.log('MySQL DATETIME 형식:', mysqlDateTime);
    
    // 예약 생성
    const [result] = await db.query(
      'INSERT INTO reservations (user_id, slot_time, slot_status) VALUES (?, ?, ?)',
      [users[0].user_id, mysqlDateTime, 'reserved']
    );

    console.log('예약 생성 결과:', result);

    res.json({ message: '예약이 완료되었습니다.' });
  } catch (error) {
    console.error('예약 생성 오류:', error);
    console.error('에러 스택:', error.stack);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.', 
      details: error.message,
      stack: error.stack 
    });
  }
});

// 예약 취소 API
app.delete('/api/reservations/:slotTime', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  try {
    const { slotTime } = req.params;
    
    // 사용자 ID 조회
    const [users] = await db.query(
      'SELECT user_id FROM users WHERE github_id = ?',
      [req.user.github_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 예약 취소 (상태를 cancelled로 변경)
    const [result] = await db.query(
      'UPDATE reservations SET slot_status = "cancelled" WHERE user_id = ? AND slot_time = ? AND slot_status = "reserved"',
      [users[0].user_id, slotTime]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }

    res.json({ message: '예약이 취소되었습니다.' });
  } catch (error) {
    console.error('예약 취소 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 기존 API
app.get('/users', (req, res) => { 
    db.query('select * from people', (err,data) => {
        res.send(data)
    })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});