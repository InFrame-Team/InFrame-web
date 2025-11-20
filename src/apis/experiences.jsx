// src/apis/experiences.js (또는 experiences.jsx)
// 🚨 'axios' 대신 'api' 인스턴스를 사용하도록 수정했습니다.
// 🚨 API_BASE_URL 변수가 필요 없도록 수정했습니다.

import api from "./api";
// import axios from "axios"; // 👈 필요 없으므로 제거 (혹은 주석 처리)

// 예약 가능 시간 조회
export async function fetchAvailableSlots(experienceId, date, signal) {
  const res = await api.get(`experiences/${experienceId}/available-slots`, {
    params: { date },
    signal,
  });
  return res.data;
}

/* HH:mm */
const toHHmm = (t) => {
  if (typeof t !== "string") return t;
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
  return t.slice(0, 5);
};

// 체험 예약 생성
export async function createReservation(
  { experienceId, reservationDate, startTime, numAdults, numChildren },
  signal
) {
  const body = {
    experienceId: Number(experienceId),
    reservationDate,
    startTime: toHHmm(startTime),
    numAdults: Number(numAdults),
    numChildren: Number(numChildren),
  };

  const res = await api.post("reservation", body, { signal });
  return res.data;
}

// 체험 텍스트 정보 생성 (이미지 제외)
export async function createExperience(payload, signal) {
  const res = await api.post("host/experiences", payload, { signal });
  return res.data; // 서버에서 생성된 experience 정보( id 포함 ) 리턴된다고 가정
}

// 생성된 체험에 이미지 업로드
export async function uploadExperienceImages(experienceId, files, signal) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const res = await api.post(
    `host/experiences/${experienceId}/images`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
    }
  );
  return res.data;
}

// =========================================================================
// ✅ [통합된 함수] 체험 ID로 상세 정보를 조회하는 함수 (Host/Explore 페이지에서 사용)
// =========================================================================
/**
 * 체험 ID로 상세 정보를 조회합니다.
 * GET /api/v1/host/experiences/{experienceId}
 * @param {number} experienceId - 조회할 체험의 ID
 * @param {AbortSignal} [signal] - 요청 취소를 위한 AbortSignal
 * @returns {Promise<{success: boolean, data: Object, message: string}>}
 */
export async function fetchExperienceDetail(experienceId, signal) {
  // API 문서: GET /api/v1/host/experiences/{experienceId}
  const endpoint = `host/experiences/${experienceId}`;

  try {
    const response = await api.get(endpoint, { signal });

    // 상세 조회 API는 title, hostName, businessName 등을 반환한다고 가정
    // 응답이 유효한 데이터 객체인지 확인
    if (response.data && (response.data.title || response.data.hostName)) {
      // HEAD와 충돌 브랜치 모두 이 엔드포인트를 사용하므로,
      // 충돌 브랜치의 상세한 응답 포맷을 따르도록 수정함
      return {
        success: true,
        data: response.data,
        message: "체험 상세 정보 조회 성공",
      };
    }

    // 데이터는 받았으나 필수 필드가 없는 경우
    return {
      success: false,
      data: response.data || {},
      message: "API 응답 구조 오류 또는 체험 없음",
    };
  } catch (error) {
    if (error.name === "CanceledError") {
      throw error; // 요청 취소는 에러로 간주하지 않고 re-throw
    }
    console.error(
      `fetchExperienceDetail (ID: ${experienceId}) 호출 중 오류 발생:`,
      error
    );
    return {
      success: false,
      data: {},
      message: `체험 상세 정보를 가져오지 못했습니다: ${error.message}`,
    };
  }
}

// =========================================================================
// ✅ [유지된 함수] Host ID로 체험 목록 조회
// =========================================================================
/**
 * 특정 호스트 ID로 등록된 체험 목록(요약)을 조회합니다.
 * GET /api/v1/host/experiences/host/{hostId}
 * @param {number} hostId 조회할 호스트 ID
 * @returns {{success: boolean, data: Array | null, message: string}}
 */
export async function getExperiencesByHostId(hostId) {
  // 💡 URL 경로를 수정: api 인스턴스는 기본 URL이 설정되어 있으므로,
  // 기본 경로 이후만 입력합니다.
  const endpoint = `host/experiences/host/${hostId}`;

  try {
    // 🚨 axios 대신 import 한 'api' 인스턴스를 사용합니다.
    const response = await api.get(endpoint);

    // 200 OK 응답을 받았을 경우
    return {
      success: true,
      data: response.data,
      message: "체험 목록 조회 성공",
    };
  } catch (error) {
    // 404 (호스트를 찾을 수 없음) 또는 500 (서버 내부 오류) 처리
    const message = `getExperiencesByHostId (Host ID: ${hostId}) 호출 중 오류 발생: ${error.message}`;

    console.error(message, error);

    // 서버 오류 발생 시 빈 배열을 반환하여 프론트엔드 로직이 멈추지 않게 함
    return {
      success: false,
      data: [],
      message: message,
    };
  }
}
