import api from "./api";

export async function getExploreRecommendations({ query, topK = 5 }) {
  try {
    const { data } = await api.get("host/experiences/recommend", {
      params: { query, topK },
    });

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("[getExploreRecommendations] error:", error);

    const message =
      error.response?.data?.message ||
      "추천 체험을 불러오는 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}
