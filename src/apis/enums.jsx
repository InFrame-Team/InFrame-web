import api from "./api";

// 카테고리 목록 조회
export async function fetchCategoryEnums(signal) {
  const res = await api.get("enums/categories", { signal });
  return res.data;
}
