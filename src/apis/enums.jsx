import api from "./api";

// 카테고리 목록 조회
export async function fetchCategoryEnums(signal) {
  const res = await api.get("enums/categories", { signal });
  return res.data;
}

// 전문 분야 목록 조회 */
export async function fetchProfessionalFields(signal) {
  const res = await api.get("enums/professionalFields", { signal });
  return res.data;
}
