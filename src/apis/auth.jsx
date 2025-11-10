// src/apis/auth.js
import api from "./api";

const storeToken = (token) => {
  if (!token) return;
  localStorage.setItem("accessToken", token);
};

// 회원가입
export async function signup({ email, password, nickname, name }) {
  const body = { email, password, nickname, name, role: "USER" };

  try {
    const { data } = await api.post("auth/sign-up", body);
    return { success: true, data };
  } catch (error) {
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
    throw new Error(
      error.response?.data?.message || "닉네임 확인 중 오류가 발생했습니다."
    );
  }
}

// 이메일 로그인
export async function signin({ email, password }) {
  try {
    const { data } = await api.post("auth/sign-in", { email, password });

    const token =
      data?.token ??
      data?.accessToken ??
      data?.data?.token ??
      data?.data?.accessToken;

    storeToken(token);

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

// 소셜 로그인
export function socialLogin(provider) {
  const base = "http://13.125.136.155:8080/api/v1";
  window.location.href = `${base}/auth/oauth2/${provider}`;
}

// 로그아웃 API
export async function logout() {
  try {
    // api 인스턴스 사용 (위 signup / signin 과 동일한 방식)
    const { data } = await api.post("auth/logout");
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[logout] error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "로그아웃 중 문제가 발생했습니다.",
    };
  }
}

// 회원 탈퇴 API
export async function deleteAccount() {
  try {
    const { data } = await api.delete("user/delete"); // 필요하면 경로 수정
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[deleteAccount] error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "회원 탈퇴 중 문제가 발생했습니다.",
    };
  }
}
