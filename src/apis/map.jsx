import api from "./api";

export async function getHostMap() {
  try {
    const { data } = await api.get("host/map");

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("[getHostMap] error:", error);

    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      "지도에 표시할 호스트 정보를 불러오는 중 오류가 발생했습니다.";

    return {
      success: false,
      status,
      message,
    };
  }
}
