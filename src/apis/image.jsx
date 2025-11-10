// src/apis/image.jsx
import api from "./api";

/**
 * 내 프로필 이미지 업로드
 * POST /api/v1/user/me/profile-image
 * form-data key: file
 */
export async function uploadProfileImage(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/user/me/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      url: res.data?.profileImageUrl || null,
    };
  } catch (error) {
    console.error("[uploadProfileImage] error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "프로필 이미지 업로드 중 오류가 발생했어요.",
    };
  }
}

/**
 * 업체 로고 이미지 업로드
 * POST /api/v1/host/companyLogo
 * form-data key: file
 */
export async function uploadCompanyLogo(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/host/companyLogo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      url: res.data?.companyLogoUrl || null,
    };
  } catch (error) {
    console.error("[uploadCompanyLogo] error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "업체 로고 업로드 중 오류가 발생했어요.",
    };
  }
}
