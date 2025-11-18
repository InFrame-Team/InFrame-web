import api from "./api";

// 내 예약 내역 조회
export async function fetchMyReservations(signal) {
  const res = await api.get("reservation/me", {
    signal,
  });
  return res.data;
}

// 로그인한 사용자의 예약 취소
export async function cancelReservation(reservationId) {
  const res = await api.patch(`reservation/${reservationId}/cancel`);
  return res.data;
}
