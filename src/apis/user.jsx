// src/apis/user.jsx
import api from "./api";

/**
 * 내 정보 조회: GET /api/v1/user/me
 *
 * response 예시:
 * {
 *   "user_id": 1,
 *   "email": "...",
 *   "name": "<name>",
 *   "nickname": "<nickname>",
 *   "role": "USER | BUSINESS",
 *   "profileImageUrl": "https://s3.../image-url.jpg"
 * }
 */
export async function getMyInfo() {
  try {
    const res = await api.get("/user/me");
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("[getMyInfo] error:", error);

    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        return {
          success: false,
          message: "로그인 정보가 없습니다. 다시 로그인 해주세요.",
        };
      }
      return {
        success: false,
        message:
          error.response.data?.message ||
          "내 정보를 불러오는 중 오류가 발생했어요.",
      };
    }

    return {
      success: false,
      message: "네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}
