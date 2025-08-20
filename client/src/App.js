import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';

const AppContainer = styled.div`
  background-color: #0f0f0f;
  min-height: 100vh;
  color: white;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 24px 36px 24px;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Avatar = styled.div`
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarFallback = styled.div`
  background-color: #1a1a1a;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;

const AvatarImage = styled.img`
  aspect-ratio: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  padding: 0 8px;
`;

const UserName = styled.p`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: white;
`;

const UserDescription = styled.p`
  font-size: 14px;
  color: #888;
  margin: 0;
`;

const RoomHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  padding: 28px 24px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  background-color: #1a1a1a;
`;

const RoomIcon = styled.svg`
  width: 24px;
  height: 24px;
  color: white;
`;

const RoomName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: white;
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 8px;
  border-bottom: 1px solid #333;
`;

const DateLabel = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: #888;
  margin: 0;
`;

const DateValue = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const TimeSlotList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TimeSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  opacity: ${props => (props.isPast || props.isReserved) ? 0.4 : 1};
`;

const TimeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimeRange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TimeText = styled.p`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
`;

const TimeSeparator = styled.svg`
  width: 12px;
  color: #888;
`;

const TimeStatus = styled.span`
  font-size: 14px;
  color: #888;
`;

const ReservedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ReservedUser = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #10b981;
`;

const ReserveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  border-radius: 6px;
  gap: 6px;
  padding: 0 12px;
  height: 32px;
  font-weight: 700;
  cursor: pointer;
  
  ${props => {
    if (props.$isPast) {
      return `
        background-color: #1a1a1a;
        color: #666;
        border: 1px solid #333;
        cursor: not-allowed;
      `;
    }
    if (props.$isReserved) {
      return `
        background-color: #dc2626;
        color: white;
        border: none;
        
        &:hover {
          background-color: #b91c1c;
        }
      `;
    }
    return `
      background-color: #10b981;
      color: white;
      border: none;
      
      &:hover {
        background-color: #059669;
      }
    `;
  }}
`;

const LogoutButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #b91c1c;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Notification = styled.div`
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
  max-width: 300px;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NotificationText = styled.span`
  color: #ccc;
  font-size: 14px;
  font-weight: 500;
`;

function App() {
  const [currentDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [reservations, setReservations] = useState([]);

  // 로그인 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/auth/status', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setIsLoggedIn(true);
        setUser(userData);
      }
    } catch (error) {
      console.log('인증 상태 확인 실패:', error);
    }
  };

  const handleLogin = async () => {
    // GitHub OAuth URL로 리다이렉트
    window.location.href = 'http://localhost:4000/auth/github';
  };

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.log('로그아웃 실패:', error);
    }
  };

  // 알림 추가 함수
  const addNotification = (message) => {
    const id = Date.now();
    const newNotification = { id, message };
    setNotifications(prev => [...prev, newNotification]);
    
    // 3초 후 자동으로 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 3000);
  };

  // 예약 정보 가져오기
  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error('예약 정보 가져오기 실패:', error);
    }
  };

  // 예약 정보 가져오기
  useEffect(() => {
    fetchReservations();
  }, []);

  // 시간대 생성 (10시부터 24시까지)
  useEffect(() => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // 10시부터 24시까지 (다음날 0시까지)
    for (let hour = 10; hour <= 24; hour++) {
      const startHour = hour;
      const endHour = hour + 1;
      
      // 24시를 넘어가면 다음날 0시로 표시
      const displayStartHour = startHour > 24 ? startHour - 24 : startHour;
      const displayEndHour = endHour > 24 ? endHour - 24 : endHour;
      
      const startTime = `${displayStartHour < 12 ? '오전' : '오후'} ${displayStartHour < 12 ? displayStartHour : displayStartHour - 12}:00`;
      const endTime = `${displayEndHour < 12 ? '오전' : '오후'} ${displayEndHour < 12 ? displayEndHour : displayEndHour - 12}:00`;
      
      // 현재 시간과 비교하여 과거 시간인지 확인
      const isPast = hour < currentHour || (hour === currentHour && currentMinute >= 0);
      
      // 해당 시간대의 예약 확인
      const reservation = reservations.find(res => {
        const resTime = new Date(res.slot_time);
        return resTime.getHours() === hour && resTime.getDate() === now.getDate() && res.slot_status === 'reserved';
      });
      
      const isReserved = !!reservation;
      const reservedBy = reservation ? reservation.display_name : null;
      
      slots.push({
        id: hour,
        timeRange: `${startTime} - ${endTime}`,
        startTime,
        endTime,
        isPast,
        isReserved,
        reservedBy
      });
    }
    setTimeSlots(slots);
  }, [reservations]);

  const handleReserve = async (slotId) => {
    if (!isLoggedIn) {
      addNotification('권한이 없습니다.');
      return;
    }
    
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return;

    try {
      // 현재 날짜와 시간을 결합하여 slot_time 생성
      const now = new Date();
      const slotDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotId, 0, 0);
      
      if (slot.isReserved && slot.reservedBy === user.displayName) {
        // 내가 예약한 시간이면 취소
        const response = await fetch(`/api/reservations/${encodeURIComponent(slotDateTime.toISOString())}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          // 즉시 로컬 상태 업데이트
          setTimeSlots(prevSlots => 
            prevSlots.map(s => 
              s.id === slotId 
                ? { ...s, isReserved: false, reservedBy: null }
                : s
            )
          );
          addNotification('예약이 취소되었습니다.');
        } else {
          const error = await response.json();
          addNotification(error.error || '예약 취소에 실패했습니다.');
        }
      } else if (!slot.isReserved) {
        // 예약 가능한 시간이면 예약
        console.log('예약 요청 데이터:', { slot_time: slotDateTime.toISOString() });
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ slot_time: slotDateTime.toISOString() })
        });
        
        if (response.ok) {
          // 즉시 로컬 상태 업데이트
          setTimeSlots(prevSlots => 
            prevSlots.map(s => 
              s.id === slotId 
                ? { ...s, isReserved: true, reservedBy: user.displayName }
                : s
            )
          );
          addNotification('예약이 완료되었습니다.');
        } else {
          const error = await response.json();
          addNotification(error.error || '예약에 실패했습니다.');
        }
      } else {
        addNotification('다른 사용자가 예약한 시간입니다.');
      }
    } catch (error) {
      console.error('예약 처리 오류:', error);
      addNotification('예약 처리 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (date) => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    
    return `${months[date.getMonth()]} ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  const ReservationPage = () => (
    <AppContainer>
      {isLoggedIn && (
        <LogoutButton onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      )}
      
      <MainContent>
        <UserProfile onClick={!isLoggedIn ? handleLogin : undefined}>
          <Avatar>
            {isLoggedIn && user?.avatar ? (
              <AvatarImage 
                src={user.avatar} 
                alt={user.displayName} 
              />
            ) : (
              <AvatarFallback>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }}>
                  <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
              </AvatarFallback>
            )}
          </Avatar>
          <UserInfo>
            <UserName>{isLoggedIn ? (user?.displayName || user?.username || '사용자') : '로그인'}</UserName>
            <UserDescription>
              {isLoggedIn ? '크래프톤 정글 9기' : '클릭하여 로그인하세요.'}
            </UserDescription>

          </UserInfo>
        </UserProfile>

        <RoomHeader>
          <RoomIcon width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.28856 0.796908C7.42258 0.734364 7.57742 0.734364 7.71144 0.796908L13.7114 3.59691C13.8875 3.67906 14 3.85574 14 4.05V10.95C14 11.1443 13.8875 11.3209 13.7114 11.4031L7.71144 14.2031C7.57742 14.2656 7.42258 14.2656 7.28856 14.2031L1.28856 11.4031C1.11252 11.3209 1 11.1443 1 10.95V4.05C1 3.85574 1.11252 3.67906 1.28856 3.59691L7.28856 0.796908ZM2 4.80578L7 6.93078V12.9649L2 10.6316V4.80578ZM8 12.9649L13 10.6316V4.80578L8 6.93078V12.9649ZM7.5 6.05672L12.2719 4.02866L7.5 1.80176L2.72809 4.02866L7.5 6.05672Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </RoomIcon>
          <RoomName>303 코칭실</RoomName>
        </RoomHeader>

        <DateInfo>
          <DateLabel>오늘은</DateLabel>
          <DateValue>{formatDate(currentDate)}</DateValue>
        </DateInfo>

        <TimeSlotList>
          {timeSlots.map((slot) => (
            <TimeSlot key={slot.id} isPast={slot.isPast}>
              <TimeInfo>
                <TimeRange>
                  <TimeText>{slot.startTime}</TimeText>
                  <TimeSeparator width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                  </TimeSeparator>
                  <TimeText>{slot.endTime}</TimeText>
                </TimeRange>
                {slot.isReserved ? (
                  <ReservedInfo>
                    <ReservedUser>{slot.reservedBy}</ReservedUser>
                    <TimeStatus>님이 예약하신 시간이에요</TimeStatus>
                  </ReservedInfo>
                ) : (
                  <TimeStatus>
                    {slot.isPast ? '이미 지난 시간이에요' : '예약 가능한 시간이예요'}
                  </TimeStatus>
                )}
              </TimeInfo>
              <ReserveButton 
                onClick={() => handleReserve(slot.id)}
                disabled={slot.isPast || (slot.isReserved && slot.reservedBy !== user?.displayName)}
                $isPast={slot.isPast}
                $isReserved={slot.isReserved}
              >
                {slot.isReserved && slot.reservedBy === user?.displayName ? '취소' : '예약'}
              </ReserveButton>
            </TimeSlot>
          ))}
        </TimeSlotList>
      </MainContent>

      {/* 알림 컨테이너 */}
      <NotificationContainer>
        {notifications.map((notification) => (
          <Notification key={notification.id}>
            <NotificationIcon>
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
            </NotificationIcon>
            <NotificationText>{notification.message}</NotificationText>
          </Notification>
        ))}
      </NotificationContainer>
    </AppContainer>
  );

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<ReservationPage />} 
        />
        <Route 
          path="/login" 
          element={<Navigate to="/" />} 
        />
        <Route 
          path="/auth/github/callback" 
          element={<Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;