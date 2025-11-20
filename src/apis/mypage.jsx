import api from "./api";

export async function getMyPageInfo() {
  try {
    const res = await api.get("/user/me");
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("[getMyPageInfo] error:", error);

    const message =
      error.response?.data?.message || "내 정보를 불러오지 못했습니다.";

    return {
      success: false,
      message,
    };
  }
}
