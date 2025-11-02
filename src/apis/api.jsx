import axios from "axios";

/**기본 axios 객체(Access Token 미포함) */
const api = axios.create({
  // 요청의 기본 URL 지정. 모든 API는 이 주소를 기준으로 호출
  baseURL: "http://13.125.136.155:8080/api/v1/",

  // 서버에 전송하는 데이터의 타입을 명시 (JSON 형식)
  headers: {
    "Content-Type": "application/json",
  },

  // 쿠키를 포함하여 요청할 수 있도록 설정
  // - 브라우저에서 서버로 쿠키 인증이 필요한 경우 true로 설정
  withCredentials: true,
});

export default api;
