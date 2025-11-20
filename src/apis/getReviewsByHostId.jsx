import api from "./api"; // api 인스턴스는 이미 정의되어 있다고 가정

/**
 * 특정 hostId에 해당하는 모든 리뷰 목록을 조회합니다.
 * @param {number} hostId - 리뷰를 조회할 호스트의 ID (필수)
 * @returns {Promise<{success: boolean, data?: Array<Object>, status?: number, message?: string}>}
 */
export async function getReviewsByHostId(hostId) {
  if (typeof hostId !== "number" || hostId <= 0) {
    return {
      success: false,
      message: "유효하지 않은 hostId입니다.",
    };
  }

  try {
    // GET /api/v1/reviews/host/{hostId} 엔드포인트 사용
    const { data } = await api.get(`reviews/host/${hostId}`);

    // 반환 데이터 형태는 ReviewDto의 배열
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error(`[getReviewsByHostId] hostId: ${hostId} error:`, error);

    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      "호스트 리뷰 목록을 불러오는 중 오류가 발생했습니다.";

    return {
      success: false,
      status,
      message,
    };
  }
}
