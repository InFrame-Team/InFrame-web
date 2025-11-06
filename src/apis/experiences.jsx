import api from "./api";

// 특정 체험의 특정 날짜에 대한 예약 가능 시간 조회
export async function fetchAvailableSlots(experienceId, date, signal) {
  const res = await api.get(`experiences/${experienceId}/available-slots`, {
    params: { date },
    signal,
  });
  return res.data;
}
