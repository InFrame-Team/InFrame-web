import api from "./api"; // 기존 파일에 이미 존재

// 기존 toggleHostLike, toggleExperienceLike 함수 아래에 추가하세요.

/**
 * 호스트 좋아요 목록 조회 API
 * GET /api/v1/likes/host
 *
 * @returns {Promise<{ success: boolean, message: string, data: Array<Object> | null }>}
 */
export async function getLikedHosts() {
  try {
    const response = await api.get("/likes/host");

    if (response.status === 200) {
      return {
        success: true,
        message: "좋아요 누른 호스트 목록을 성공적으로 조회했어요.",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.data?.message || "호스트 목록 조회에 실패했어요.",
      data: null,
    };
  } catch (error) {
    console.error("[getLikedHosts] error:", error);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        return { success: false, message: "로그인이 필요해요.", data: null };
      }
      if (status === 404) {
        return {
          success: false,
          message: "사용자를 찾을 수 없어요.",
          data: null,
        }; // 명세에 따른 404 메시지
      }

      return {
        success: false,
        message: data?.message || "호스트 목록 조회 중 오류가 발생했어요.",
        data: null,
      };
    }

    return {
      success: false,
      message: "네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      data: null,
    };
  }
}

/**
 * 체험(상품) 좋아요 목록 조회 API
 * GET /api/v1/likes/experience
 *
 * @returns {Promise<{ success: boolean, message: string, data: Array<Object> | null }>}
 */
export async function getLikedExperiences() {
  try {
    const response = await api.get("/likes/experience");

    if (response.status === 200) {
      return {
        success: true,
        message: "좋아요 누른 체험 목록을 성공적으로 조회했어요.",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.data?.message || "체험 목록 조회에 실패했어요.",
      data: null,
    };
  } catch (error) {
    console.error("[getLikedExperiences] error:", error);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        return { success: false, message: "로그인이 필요해요.", data: null };
      }
      if (status === 404) {
        return {
          success: false,
          message: "사용자를 찾을 수 없어요.",
          data: null,
        }; // 명세에 따른 404 메시지
      }

      return {
        success: false,
        message: data?.message || "체험 목록 조회 중 오류가 발생했어요.",
        data: null,
      };
    }

    return {
      success: false,
      message: "네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      data: null,
    };
  }
}
