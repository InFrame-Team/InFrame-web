import api from "./api";
// 내 예약 내역 조회
export async function getMyReservations() {
  try {
    const res = await api.get("/reservation/me");

    // Swagger 예시상 배열이 그대로 내려온다고 가정
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error) {
    console.error("[getMyReservations] error:", error);

    const message =
      error.response?.data?.message || "예약 내역을 불러오지 못했습니다.";

    return {
      success: false,
      message,
    };
  }
}
