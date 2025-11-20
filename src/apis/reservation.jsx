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

export async function getHostReservations() {
  try {
    const { data } = await api.get("/host/reservations");

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("[getHostReservations] error:", error);

    const message =
      error.response?.data?.message ||
      "호스트 예약 목록을 불러오는 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}
