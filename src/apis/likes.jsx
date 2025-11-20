import api from "./api";

// 내가 '하트' 누른 호스트 목록 조회
export async function fetchLikedHosts() {
  const res = await api.get("/likes/host");
  return res.data;
}

//내가 '하트' 누른 체험 목록 조회
export async function fetchLikedExperiences() {
  const res = await api.get("/likes/experience");
  return res.data;
}

//  체험 하트 토글
export async function toggleExperienceLike(experienceId) {
  const res = await api.post(`/likes/experience/${experienceId}`);
  return res.data;
}
