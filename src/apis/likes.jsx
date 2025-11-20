import api from "./api";

// 내가 '하트' 누른 호스트 목록 조회
export async function fetchLikedHosts() {
  const res = await api.get("/likes/host");
  return res.data;
}
//내가 '하트' 누른 체험 목록 조회
export async function fetchLikedExperiences() {
  const res = await api.get("/likes/experience");
  return res.data;
}

//  체험 하트 토글
export async function toggleExperienceLikes(experienceId) {
  const res = await api.post(`/likes/experience/${experienceId}`);
  return res.data;
}

// 호스트 좋아요 토글
export async function toggleHostLikes(hostId, signal) {
  const res = await api.post(`/likes/host/${hostId}`, null, {
    signal,
  });
  return res.data;
}

/**
 * 1. GET /api/v1/likes/host - 내가 '하트' 누른 호스트 목록 조회
 */
export async function getLikedHosts() {
  try {
    const { data } = await api.get("/likes/host");

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("[getLikedHosts] error:", error);

    const message =
      error.response?.data?.message ||
      "좋아요한 호스트 목록을 불러오는 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}

/**
 * 2. GET /api/v1/likes/experience - 내가 '하트' 누른 체험 목록 조회
 */
export async function getLikedExperiences() {
  try {
    const { data } = await api.get("/likes/experience");

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("[getLikedExperiences] error:", error);

    const message =
      error.response?.data?.message ||
      "좋아요한 체험 목록을 불러오는 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}

/**
 * 3. POST /api/v1/likes/host/{hostId} - 호스트 '하트' 토글
 */
// 🟢 인자를 단일 값(hostId)으로 받는 버전
export async function toggleHostLike(hostId) {
  if (!hostId) {
    return { success: false, message: "호스트 ID가 필요합니다." };
  }

  try {
    // POST 요청은 응답으로 string이 올 수 있으므로 data 대신 status로 성공 확인
    await api.post(`/likes/host/${hostId}`);

    return {
      success: true,
      message: "호스트 좋아요 상태가 변경되었습니다.",
    };
  } catch (error) {
    console.error("[toggleHostLike] error:", error);

    const message =
      error.response?.data?.message ||
      "호스트 좋아요 상태 변경 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}

/**
 * 4. POST /api/v1/likes/experience/{experienceId} - 체험 '하트' 토글
 */
// 🟢 인자를 단일 값(experienceId)으로 받는 버전
export async function toggleExperienceLike(experienceId) {
  if (!experienceId) {
    return { success: false, message: "체험 ID가 필요합니다." };
  }

  try {
    await api.post(`/likes/experience/${experienceId}`);

    return {
      success: true,
      message: "체험 좋아요 상태가 변경되었습니다.",
    };
  } catch (error) {
    console.error("[toggleExperienceLike] error:", error);

    const message =
      error.response?.data?.message ||
      "체험 좋아요 상태 변경 중 문제가 발생했습니다.";

    return {
      success: false,
      message,
    };
  }
}
