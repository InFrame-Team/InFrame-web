import api from "./api";

// 회원가입
export async function signup({ email, password, nickname, name }) {
  const body = { email, password, nickname, name, role: "USER" };
  try {
    const { data } = await api.post("auth/sign-up", body);
    return { success: true, data };
  } catch (error) {
    // 400: 필드 누락 / 409: 이메일 중복
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (status === 400
        ? "입력값을 확인해주세요."
        : "회원가입 중 오류가 발생했습니다.");
    return { success: false, status, message };
  }
}

// 닉네임 중복 확인
export async function checkNickname(nickname) {
  try {
    const { data } = await api.get("auth/check-nickname", {
      params: { nickname },
    });
    return { available: true, message: "사용 가능한 닉네임입니다." };
  } catch (error) {
    if (error.response && error.response.status === 409) {
      return {
        available: false,
        message: error.response.data?.message || "이미 사용 중인 닉네임입니다.",
      };
    }
    // 다른 에러 (네트워크 등)
    throw new Error(
      error.response?.data?.message || "닉네임 확인 중 오류가 발생했습니다."
    );
  }
}

// 이메일 로그인
export async function signin({ email, password }) {
  try {
    const { data } = await api.post("/auth/sign-in", { email, password });
    return { success: true, data };
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (status === 404
        ? "해당 유저를 찾을 수 없습니다."
        : status === 400
        ? "입력값을 확인해주세요."
        : "로그인 중 오류가 발생했습니다.");
    return { success: false, status, message };
  }
}
