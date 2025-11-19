import api from "./api";

// 리뷰 작성
export async function createReview(reservationId, reviewData, imageFiles = []) {
  const formData = new FormData();

  const dtoBlob = new Blob([JSON.stringify(reviewData)], {
    type: "application/json",
  });
  formData.append("reviewRequestDto", dtoBlob);

  // reviewImage -> 여러 장 가능하도록 append
  imageFiles.forEach((file) => {
    formData.append("reviewImage", file);
  });

  const res = await api.post(`reviews/${reservationId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

// 특정 체험의 리뷰 목록 조회
export async function fetchReviewsByExperience(experienceId, signal) {
  const res = await api.get(`/reviews/experience/${experienceId}`, {
    signal,
  });
  return res.data;
}
