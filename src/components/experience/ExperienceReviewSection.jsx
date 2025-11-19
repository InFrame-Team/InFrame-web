import React, { useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { fetchReviewsByExperience } from "../../apis/reviews";
import fakeProfile from "../../assets/fakeProfile.svg";

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center">
      {Array.from({ length: full }).map((_, i) => (
        <AiFillStar key={`f-${i}`} className="w-4 h-4 text-[#F13030]" />
      ))}
      {hasHalf && <AiFillStar className="w-4 h-4 text-[#F9A825]" />}
      {Array.from({ length: empty }).map((_, i) => (
        <AiFillStar key={`e-${i}`} className="w-4 h-4 text-[#E7E7E7]" />
      ))}
    </div>
  );
}

function formatVisitDate(isoString) {
  if (!isoString) return "";

  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day} · 방문`;
}

export default function ExperienceReviewSection({
  experienceId,
  totalReviewCount,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    if (!experienceId) return;

    const ac = new AbortController();
    setLoading(true);
    setErrorMsg("");

    fetchReviewsByExperience(experienceId, ac.signal)
      .then((res) => {
        const list = res || [];
        setReviews(list);

        // 리뷰 개수가 3개 미만이면 그만큼만 보이게
        setVisibleCount(Math.min(3, list.length));
      })
      .catch((e) => {
        if (e.name === "CanceledError" || e.code === "ERR_CANCELED") return;
        console.error(e);
        setErrorMsg("리뷰를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [experienceId]);

  const count = totalReviewCount ?? reviews.length;
  const remaining = Math.max(count - visibleCount, 0);

  return (
    <section className="pt-6">
      {/* 헤더 */}
      <div className="flex items-baseline gap-2 mb-4">
        <h2 className="text-[20px] font-bold text-[#3A3A3A]">리뷰</h2>
        <span className="text-[20px] font-bold text-[#F13030]">{count}</span>
      </div>

      {/* 로딩 / 에러 */}
      {loading && (
        <p className="text-[13px] text-[#999999] mb-2">
          리뷰를 불러오는 중입니다…
        </p>
      )}
      {errorMsg && (
        <p className="text-[13px] text-[#F13030] mb-2">{errorMsg}</p>
      )}

      {/* 리뷰 없을 때 */}
      {!loading && !errorMsg && reviews.length === 0 && (
        <p className="text-[13px] text-[#9E9E9E]">
          아직 등록된 리뷰가 없습니다.
        </p>
      )}

      {/* 리뷰 리스트 */}
      <ul className="space-y-6">
        {reviews.slice(0, visibleCount).map((review) => (
          <li key={review.reviewId} className="pb-4">
            {/* 상단: 프로필, 닉네임, 별점, 날짜 */}
            <div className="flex gap-3 mb-2">
              <img
                src={review.writerProfileImageUrl || fakeProfile}
                alt={review.writerNickname}
                className="w-[40px] h-[40px] rounded-full object-cover mt-1"
              />
              <div className="flex-1">
                <span className="text-[17px] font-bold text-[#3A3A3A] ml-0.5">
                  {review.writerNickname}
                </span>

                <div className="flex items-center gap-2 mb-1">
                  <Stars value={review.rating} />
                  <p className="text-[14px] font-medium text-[#A0A0A0]">
                    {formatVisitDate(review.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* 코멘트 */}
            <p className="text-[16px] font-medium text-[#555558] leading-[1.5] mb-3">
              {review.comment}
            </p>

            {/* 리뷰 이미지 */}
            {review.reviewImageUrl && (
              <div className="mt-1">
                <img
                  src={review.reviewImageUrl}
                  alt="review"
                  className="w-[120px] h-[120px] rounded-[5px] object-cover"
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* 더보기 버튼: 남은 리뷰가 있을 때만 */}
      {!loading &&
        !errorMsg &&
        reviews.length > 0 &&
        visibleCount < reviews.length && (
          <button
            type="button"
            onClick={() => setVisibleCount(reviews.length)}
            className="mt-6 w-full h-[40px] rounded-[5px] border border-[#E9E9EC] text-[13px] font-medium text-[#3A3A3A]"
          >
            {remaining}개 리뷰 더보기
          </button>
        )}
    </section>
  );
}
