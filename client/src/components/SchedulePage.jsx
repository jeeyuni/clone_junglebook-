import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN || 'http://localhost:4000';

function formatTodayKr(date = new Date()){
	const formatter = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' });
	const parts = formatter.formatToParts(date);
	const m = parts.find(p => p.type === 'month')?.value;
	const d = parts.find(p => p.type === 'day')?.value;
	const w = parts.find(p => p.type === 'weekday')?.value;
	return `${m}월 ${d}일 (${w})`;
}

function SlotRow({ slot, onReserve }){
	const isPast = slot.status === 'past';
	const isReserved = slot.status === 'reserved';
	const isAvailable = slot.status === 'available';
	return (
		<div className={`flex items-center justify-between px-6 py-5 ${isPast ? 'opacity-40' : ''}`}>
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-1">
					<p className="text-lg font-semibold">{slot.start.includes(':') ? (slot.start[0] === '0' || Number(slot.start.split(':')[0]) < 12 ? `오전 ${slot.start}` : `오후 ${Number(slot.start.split(':')[0]) - 12}:${slot.start.split(':')[1]}`) : slot.start}</p>
					<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 text-muted-foreground"><path d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
					<p className="text-lg font-semibold">{slot.end.includes(':') ? (slot.end[0] === '0' || Number(slot.end.split(':')[0]) < 12 ? `오전 ${slot.end}` : `오후 ${Number(slot.end.split(':')[0]) - 12}:${slot.end.split(':')[1]}`) : slot.end}</p>
				</div>
				{isPast && (<span className="text-sm text-muted-foreground">이미 지난 시간이에요</span>)}
				{isAvailable && (<span className="text-sm text-muted-foreground">예약 가능한 시간이예요</span>)}
				{isReserved && (
					<div className="flex items-center space-x-1">
						<span className="text-sm font-medium text-primary">{slot.reservedBy}</span>
						<span className="text-sm text-muted-foreground">님이 예약하신 시간이에요</span>
					</div>
				)}
			</div>
			<button
				className={`inline-flex items-center justify-center whitespace-nowrap text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${isAvailable ? 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90' : 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50'} h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 font-bold`}
				disabled={!isAvailable}
				onClick={() => onReserve(slot)}
			>
				예약
			</button>
		</div>
	);
}

export default function SchedulePage(){
	const [user, setUser] = useState(null);
	const [slots, setSlots] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const [meRes, slotsRes] = await Promise.all([
					api.get('/api/me'),
					api.get('/api/slots'),
				]);
			setUser(meRes.data?.user || null);
			setSlots(slotsRes.data?.slots || []);
			setLoading(false);
			// eslint-disable-next-line no-empty
			} catch (e) { setLoading(false); }
		})();
	}, []);

	const todayText = useMemo(() => formatTodayKr(), []);

	async function handleReserve(slot){
		try{
			await api.post('/api/reserve', { start: slot.start, end: slot.end });
			alert('예약이 완료되었습니다.');
		} catch(e){
			alert('로그인 후 예약할 수 있습니다.');
			window.location.href = `${SERVER_ORIGIN}/login/github`;
		}
	}

	function handleLogin(){
		window.location.href = `${SERVER_ORIGIN}/login/github`;
	}

	async function handleLogout(){
		await api.post('/api/logout');
		setUser(null);
	}

	return (
		<div className="w-full max-w-[480px] mx-auto">
			<div className="flex items-center justify-between px-6 py-3">
				{user ? (
					<button onClick={handleLogout} className="text-sm text-muted-foreground underline">로그아웃</button>
				) : (
					<button onClick={handleLogin} className="text-sm text-muted-foreground underline">GitHub 로그인</button>
				)}
			</div>
			<div className="flex items-center gap-2 px-6 py-9">
				<span data-slot="avatar" className="relative flex shrink-0 overflow-hidden rounded-full size-15">
					<img data-slot="avatar-image" className="aspect-square size-full" alt={user?.displayName || '사용자'} src={user?.photos?.[0]?.value || 'https://avatars.githubusercontent.com/u/120994776?v=4'} />
				</span>
				<div className="px-2">
					<p className="text-lg font-bold">{user?.displayName || '이지윤'}</p>
					<p className="text-sm text-muted-foreground">크래프톤 정글 9기</p>
				</div>
			</div>
			<div className="sticky top-0 z-10 w-full px-6 py-7 flex justify-start items-center gap-3 bg-secondary">
				<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"><path d="M7.28856 0.796908C7.42258 0.734364 7.57742 0.734364 7.71144 0.796908L13.7114 3.59691C13.8875 3.67906 14 3.85574 14 4.05V10.95C14 11.1443 13.8875 11.3209 13.7114 11.4031L7.71144 14.2031C7.57742 14.2656 7.42258 14.2656 7.28856 14.2031L1.28856 11.4031C1.11252 11.3209 1 11.1443 1 10.95V4.05C1 3.85574 1.11252 3.67906 1.28856 3.59691L7.28856 0.796908ZM2 4.80578L7 6.93078V12.9649L2 10.6316V4.80578ZM8 12.9649L13 10.6316V4.80578L8 6.93078V12.9649ZM7.5 6.05672L12.2719 4.02866L7.5 1.80176L2.72809 4.02866L7.5 6.05672Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
				<h1 className="text-2xl font-bold">303 코칭실</h1>
			</div>
			<div className="flex items-center px-6 py-5 gap-2 border-b">
				<p className="text-xl font-semibold text-muted-foreground">오늘은</p>
				<p className="text-xl font-semibold">{todayText}</p>
			</div>
			{loading ? (
				<div className="px-6 py-8 text-sm text-muted-foreground">불러오는 중…</div>
			) : (
				slots.map((s, idx) => (
					<SlotRow key={`${s.start}-${idx}`} slot={s} onReserve={handleReserve} />
				))
			)}
		</div>
	);
}
