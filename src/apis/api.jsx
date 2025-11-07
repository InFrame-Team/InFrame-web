import axios from "axios";

/**기본 axios 객체(Access Token 미포함) */
const api = axios.create({
  // 요청의 기본 URL 지정. 모든 API는 이 주소를 기준으로 호출
  baseURL: "http://13.125.136.155:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // 로그인 후 저장한 토큰
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
