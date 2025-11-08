import api from "./api";

/**
 * 사업자번호 유효성 검증 API
 * DB 중복 확인 및 공공데이터 API를 통해 유효한 사업자 번호인지 검증합니다.
 *
 * @param {string} businessNumber - 검증할 사업자 번호 (10자리)
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export default async function checkBusinessNumber(businessNumber) {
  try {
    // GET 요청 + 쿼리 파라미터 전달
    const response = await api.get("/host/check-business-number", {
      params: { businessNumber },
    });

    if (response.status === 200) {
      return {
        success: true,
        message: "확인되었습니다.",
      };
    }

    // 200 외의 정상 응답 처리
    return {
      success: false,
      message: response.data?.message || "유효하지 않은 사업자번호예요.",
    };
  } catch (error) {
    console.error("[checkBusinessNumber] error:", error);

    // 서버에서 에러 응답 준 경우
    if (error.response) {
      const { status, data } = error.response;

      if (status === 409) {
        return { success: false, message: "이미 사용 중인 사업자번호예요." };
      } else if (status === 400) {
        return {
          success: false,
          message: "사업자번호 형식이 올바르지 않아요.",
        };
      }

      return {
        success: false,
        message: data?.message || "사업자번호 검증 중 오류가 발생했어요.",
      };
    }

    // 네트워크 또는 예외적인 오류
    return {
      success: false,
      message: "네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}
