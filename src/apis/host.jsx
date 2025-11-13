import api from "./api";

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
