const mysql = require('mysql2/promise');

async function testDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: '12340',
    database: 'junglebook_db',
    port: 3306,
  });

  try {
    console.log('데이터베이스 연결 성공');

    // 테이블 구조 확인
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('테이블 목록:', tables);

    // reservations 테이블 구조 확인
    const [columns] = await connection.execute('DESCRIBE reservations');
    console.log('reservations 테이블 구조:', columns);

    // users 테이블 구조 확인
    const [userColumns] = await connection.execute('DESCRIBE users');
    console.log('users 테이블 구조:', userColumns);

    // 샘플 데이터 삽입 테스트
    const testSlotTime = new Date();
    testSlotTime.setHours(15, 0, 0, 0); // 오후 3시

    console.log('테스트 slot_time:', testSlotTime.toISOString());

    // users 테이블에 테스트 사용자 추가
    await connection.execute(`
      INSERT IGNORE INTO users (github_id, user_name, display_name, profile_url, access_token) 
      VALUES ('test123', 'testuser', 'Test User', 'https://example.com/avatar.jpg', 'test_token')
    `);

    // 사용자 ID 조회
    const [users] = await connection.execute('SELECT user_id FROM users WHERE github_id = ?', ['test123']);
    console.log('테스트 사용자:', users);

    if (users.length > 0) {
      // 예약 삽입 테스트
      const [result] = await connection.execute(
        'INSERT INTO reservations (user_id, slot_time, slot_status) VALUES (?, ?, ?)',
        [users[0].user_id, testSlotTime, 'reserved']
      );
      console.log('예약 삽입 결과:', result);

      // 예약 조회 테스트
      const [reservations] = await connection.execute('SELECT * FROM reservations WHERE user_id = ?', [users[0].user_id]);
      console.log('조회된 예약:', reservations);
    }

  } catch (error) {
    console.error('데이터베이스 테스트 오류:', error);
  } finally {
    await connection.end();
    console.log('데이터베이스 연결 종료');
  }
}

testDatabase();
