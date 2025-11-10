// src/apis/explore.js
import api from "./api";

/**
 * AI 체험 추천 API
 * GET /api/v1/host/experiences/recommend
 *
 * @param {Object} params
 * @param {string} params.query - 검색 문장 (필수)
 * @param {number} [params.topK=5] - 추천 개수 (기본 5개)
 */
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
