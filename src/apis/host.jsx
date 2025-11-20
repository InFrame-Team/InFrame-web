import api from "./api";

/**
 * 호스트 정보 업데이트 (POST /host/update)
 * @param {object} payload - 업데이트할 호스트 정보
 * @returns {{success: boolean, data?: object, message?: string}}
 */
export async function updateHost(payload) {
  try {
    const res = await api.post("/host/update", payload);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("[updateHost] error:", error);

    if (error.response) {
      console.error(
        "[updateHost] response data:",
        error.response.status,
        error.response.data
      );

      return {
        success: false,
        message:
          error.response.data?.message ||
          "호스트 정보 저장 중 오류가 발생했어요.",
      };
    }

    return {
      success: false,
      message: "네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}

// ------------------------------------------------------------------
// ⭐ 내 호스트 정보 조회 (GET /host/me)
// ------------------------------------------------------------------

/**
 * 현재 로그인된 호스트의 정보를 조회합니다.
 * @returns {Promise<{success: boolean, data: object | null, message: string}>}
 */
async function getMyHostInfoOriginal() {
  // 함수 이름 변경 (내부용)
  try {
    const response = await api.get("/host/me"); // API 경로: /api/v1/host/me

    if (response.data && response.data.hostId) {
      return {
        success: true,
        data: response.data,
        message: "호스트 정보 조회 성공",
      };
    } else if (response.data && response.data.success === false) {
      return {
        success: false,
        data: null,
        message: response.data.message || "호스트 정보 조회 실패",
      };
    } else {
      // 404 Host not found (호스트로 가입하지 않은 경우)도 포함될 수 있음
      return {
        success: false,
        data: null,
        message: "호스트 정보 조회 결과가 없습니다.",
      };
    }
  } catch (error) {
    console.error("getMyHostInfo 호출 중 오류 발생:", error);
    // 401 인증 실패 등
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "API 호출 오류",
    };
  }
}

// ------------------------------------------------------------------
// ⭐ 특정 호스트 관련 정보 조회 함수들
// ------------------------------------------------------------------

/**
 * 특정 호스트의 상세 정보를 조회합니다. (GET /host/{hostId})
 * @param {number} hostId - 조회할 호스트 ID
 * @param {AbortSignal} [signal] - 요청 취소를 위한 AbortSignal
 * @returns {Promise<object>}
 */
export async function fetchHostDetail(hostId, signal) {
  const res = await api.get(`host/${hostId}`, {
    signal,
  });
  return res.data;
}

/**
 * 특정 호스트가 등록한 모든 체험 목록을 조회합니다. (GET /host/experiences/host/{hostId})
 * @param {number} hostId - 조회할 호스트 ID
 * @returns {Promise<object>}
 */
export async function fetchHostProgramsByHost(hostId) {
  const res = await api.get(`/host/experiences/host/${hostId}`);
  return res.data;
}

/**
 * 특정 호스트의 모든 이미지 목록을 조회합니다. (GET /host/experiences/host/{hostId}/images)
 * @param {number} hostId - 조회할 호스트 ID
 * @returns {Promise<object>}
 */
export async function fetchHostImages(hostId) {
  const res = await api.get(`/host/experiences/host/${hostId}/images`);
  return res.data;
}

/**
 * 현재 호스트가 등록한 체험 목록을 조회합니다. (GET /host/experiences/my-list)
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function getMyHostExperiences() {
  try {
    const res = await api.get("/host/experiences/my-list");

    if (res.data) {
      return { success: true, data: res.data };
    }

    return { success: false, message: "체험 목록을 찾을 수 없습니다." };
  } catch (error) {
    console.error("[getMyHostExperiences] error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "API 호출 오류",
    };
  }
}

// ------------------------------------------------------------------
// ⭐ 별칭(Alias)을 사용하여 함수 내보내기
// ------------------------------------------------------------------

// getMyHostInfoOriginal 함수를 getMyHostInfo와 fetchMyHostProfile 이름으로 내보냅니다.
export {
  getMyHostInfoOriginal as getMyHostInfo,
  getMyHostInfoOriginal as fetchMyHostProfile,
};
