import api from "./api";

// 내 예약 내역 조회
export async function fetchMyReservations(signal) {
  const res = await api.get("reservation/me", {
    signal,
  });
  return res.data;
}
