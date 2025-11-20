import api from "./api";

// 체험 좋아요 토글
export async function toggleExperienceLike(experienceId) {
  const res = await api.post(`/likes/experience/${experienceId}`);
  return res.data;
}
