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

// 내 호스트 정보 조회
export async function fetchMyHostProfile(signal) {
  const res = await api.get("host/me", { signal });
  return res.data;
}

// 특정 호스트 상세 정보 조회
export async function fetchHostDetail(hostId, signal) {
  const res = await api.get(`host/${hostId}`, {
    signal,
  });
  return res.data;
}

// 특정 호스트의 모든 체험 목록 조회
export async function fetchHostProgramsByHost(hostId) {
  const res = await api.get(`/host/experiences/host/${hostId}`);
  return res.data;
}

// 특정 호스트의 모든 이미지 목록 조회
export async function fetchHostImages(hostId) {
  const res = await api.get(`/host/experiences/host/${hostId}/images`);
  return res.data;
}
