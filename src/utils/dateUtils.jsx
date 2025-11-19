// YYYY년 M월 D일 (요일) 포맷
export function formatKoreanDate(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = weekdays[d.getDay()];

  return `${y}년 ${m}월 ${day}일 (${w})`;
}

// reservedStartTime 기준 D-Day 메시지 생성
export function getDDayLabel(reservedStartTime) {
  const now = new Date();
  const target = new Date(reservedStartTime);

  const startDate = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = startDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays}일 후에 만나요`;
  if (diffDays === 0) return "오늘 만나요";
  return `${Math.abs(diffDays)}일 전에 만났어요`;
}
