import api from "./api";

/**
 * 호스트 정보(역할 변경 포함) 업데이트 API
 *
 * @param {Object} payload
 * @param {string} payload.businessNumber  - 사업자 번호 (예: "1234567890")
 * @param {string} payload.businessName    - 사업자 명
 * @param {string} payload.businessPhoneNumber - 고객센터 전화번호
 * @param {string} payload.businessEmail   - 고객센터 이메일
 * @param {string} payload.kakaoAddress    - 카카오톡 채널 주소
 * @param {string} payload.description     - 한 줄 소개 / 설명
 * @param {number} payload.latitude        - 위도
 * @param {number} payload.longitude       - 경도
 * @param {string} payload.addressBase     - 기본 주소
 * @param {string} payload.addressDetail   - 상세 주소
 *
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
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
        error.response.data // 🔴 이게 어떤 필드가 잘못됐는지 말해줄 거야
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
