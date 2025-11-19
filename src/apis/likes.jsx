import api from "./api"; // Axios 인스턴스라고 가정

/**
 * 1. GET /api/v1/likes/host - 내가 '하트' 누른 호스트 목록 조회
 * @returns {Promise<{success: boolean, data?: Array<Object>, message?: string}>}
 */
export async function getLikedHosts() {
  try {
    const { data } = await api.get("/likes/host");

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("[getLikedHosts] error:", error);

    const message =
      error.response?.data?.message ||
      "좋아요한 호스트 목록을 불러오는 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}

/**
 * 2. GET /api/v1/likes/experience - 내가 '하트' 누른 체험 목록 조회
 * @returns {Promise<{success: boolean, data?: Array<Object>, message?: string}>}
 */
export async function getLikedExperiences() {
  try {
    const { data } = await api.get("/likes/experience");

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("[getLikedExperiences] error:", error);

    const message =
      error.response?.data?.message ||
      "좋아요한 체험 목록을 불러오는 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}

/**
 * 3. POST /api/v1/likes/host/{hostId} - 호스트 '하트' 토글
 * @param {number} hostId - 하트를 누르거나 취소할 호스트 ID
 * @returns {Promise<{success: boolean, message?: string}>}
 */
// 🟢 수정된 부분: 인자를 단일 값(hostId)으로 받도록 변경했습니다.
export async function toggleHostLike(hostId) {
  if (!hostId) {
    return { success: false, message: "호스트 ID가 필요합니다." };
  }

  try {
    // POST 요청은 응답으로 string이 올 수 있으므로 data 대신 status로 성공 확인
    await api.post(`/likes/host/${hostId}`);

    return {
      success: true,
      message: "호스트 좋아요 상태가 변경되었습니다.",
    };
  } catch (error) {
    console.error("[toggleHostLike] error:", error);

    const message =
      error.response?.data?.message ||
      "호스트 좋아요 상태 변경 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}

/**
 * 4. POST /api/v1/likes/experience/{experienceId} - 체험 '하트' 토글
 * @param {number} experienceId - 하트를 누르거나 취소할 체험 ID
 * @returns {Promise<{success: boolean, message?: string}>}
 */
// 🟢 수정된 부분: 인자를 단일 값(experienceId)으로 받도록 변경했습니다.
export async function toggleExperienceLike(experienceId) {
  if (!experienceId) {
    return { success: false, message: "체험 ID가 필요합니다." };
  }

  try {
    // POST 요청은 응답으로 string이 올 수 있으므로 data 대신 status로 성공 확인
    await api.post(`/likes/experience/${experienceId}`);

    return {
      success: true,
      message: "체험 좋아요 상태가 변경되었습니다.",
    };
  } catch (error) {
    console.error("[toggleExperienceLike] error:", error);

    const message =
      error.response?.data?.message ||
      "체험 좋아요 상태 변경 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}
