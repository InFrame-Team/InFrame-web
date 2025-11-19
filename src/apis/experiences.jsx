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

// 체험 텍스트 정보 생성 (이미지 제외)
export async function createExperience(payload, signal) {
  const res = await api.post("host/experiences", payload, { signal });
  return res.data; // 서버에서 생성된 experience 정보( id 포함 ) 리턴된다고 가정
}

// 생성된 체험에 이미지 업로드
export async function uploadExperienceImages(experienceId, files, signal) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const res = await api.post(
    `host/experiences/${experienceId}/images`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
    }
  );
  return res.data;
}

// 체험 상세 조회
export async function fetchExperienceDetail(experienceId, signal) {
  const res = await api.get(`host/experiences/${experienceId}`, { signal });
  return res.data;
}
