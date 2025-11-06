import api from "./api";

// 예약 가능 시간 조회
export async function fetchAvailableSlots(experienceId, date, signal) {
  const res = await api.get(`experiences/${experienceId}/available-slots`, {
    params: { date },
    signal,
  });
  return res.data;
}

/* HH:mm */
const toHHmm = (t) => {
  if (typeof t !== "string") return t;
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
  return t.slice(0, 5);
};

// 체험 예약 생성
export async function createReservation(
  { experienceId, reservationDate, startTime, numAdults, numChildren },
  signal
) {
  const body = {
    experienceId: Number(experienceId),
    reservationDate,
    startTime: toHHmm(startTime),
    numAdults: Number(numAdults),
    numChildren: Number(numChildren),
  };

  const res = await api.post("reservation", body, { signal });
  return res.data;
}
