import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import fakeProfile2 from "../../assets/fakeProfile2.png";

export default function ReservationCard({
  reservation,
  onClickReview,
  onClickContactHost,
  onClickDirections, // ✅ 길찾기 콜백
}) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const {
    id,
    dateLabel,
    hostName,
    hostSubtitle,
    title,
    amount,
    hostProfileImageUrl,
    avatarBg = "#FFEFEF",
    isUpcoming,
    reviewWritten,
    status,
    experienceId,
  } = reservation;

  const isCancelled = status === "CANCELLED";
  const isReserved = status === "RESERVED";
  const isCompleted = status === "COMPLETED";

  // 연락 버튼 노출: 예약 중 or 취소
  const showContactHost = isCancelled || isReserved;

  const avatarSrc = hostProfileImageUrl || fakeProfile2;

  // 1차 버튼 라벨
  const primaryLabel =
    isReserved || isCancelled
      ? "길찾기"
      : isCompleted && reviewWritten
      ? "후기 작성 완료"
      : isCompleted
      ? "후기 작성"
      : "길찾기";

  // 2차 버튼 라벨
  const secondaryLabel = showContactHost
    ? "호스트에게 연락하기"
    : "같은 건으로 예약하기";

  // COMPLETED + 리뷰 작성한 경우에만 비활성
  const primaryDisabled = isCompleted && reviewWritten;

  const handlePrimaryClick = () => {
    // ✅ 1) 완료 + 아직 리뷰 안 썼을 때 → 리뷰 작성
    if (isCompleted && !reviewWritten) {
      onClickReview?.();
      return;
    }

    // ✅ 2) 그 외(예약중/취소 등) → 길찾기
    if (!isCompleted) {
      onClickDirections?.();
    }
  };

  const handleClickDetail = () => {
    navigate(`/my/reservations/${id}`, {
      state: { reservation },
    });
  };

  const handleSecondaryClick = () => {
    if (showContactHost) {
      // 호스트에게 연락하기
      onClickContactHost?.(reservation);
    } else {
      // 같은 건으로 예약하기 → 체험 상세로 이동
      if (!experienceId) return;
      navigate(`/experiences/${experienceId}`);
    }
  };

  return (
    <section className="w-full bg-white rounded-[10px] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* 상단 날짜 + 상태 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-medium text-[#A0A0A0]">
          {dateLabel}
          {isCancelled && (
            <span className="ml-3 text-[14px] font-medium text-[#F13030]">
              취소
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={handleClickDetail}
          className="inline-flex items-center px-3 py-1 rounded-full bg-[#F6F6F6] text-[12px] text-[#7E8082] font-medium"
        >
          예약상세
        </button>
      </div>

      {/* 호스트 정보 + 하트 */}
      <div className="flex items-start justify-between mt-1 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-[55px] h-[55px] rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: avatarBg }}
          >
            <img
              src={avatarSrc}
              alt={hostName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-bold text-[#3A3A3A]">
              {hostName}
            </span>
            <span className="text-[14px] font-medium text-[#3A3A3A]">
              {hostSubtitle}
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="관심 추가"
          onClick={() => setLiked((prev) => !prev)}
          className="w-8 h-8 flex items-center justify-center self-start mt-[2px]"
        >
          {liked ? (
            <FaHeart size={20} className="text-[#FF4B4B]" />
          ) : (
            <FaRegHeart size={20} className="text-[#3A3A3A]" />
          )}
        </button>
      </div>

      {/* 프로그램 제목 */}
      <p className="text-[16px] font-medium text-[#3A3A3A] ml-0.5 mb-4 pb-4 border-b border-[#F5F5F5]">
        {title}
      </p>

      {/* 결제액 */}
      <div className="flex items-center justify-between ml-0.5 mb-4">
        <span className="text-[16px] font-bold text-[#3A3A3A]">결제금액</span>
        <span
          className={`text-[16px] font-bold ${
            isCancelled ? "text-[#B2B3B5]" : "text-[#3A3A3A]"
          }`}
        >
          {amount.toLocaleString()}원{isCancelled && " 취소"}
        </span>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 mt-3 mb-1">
        <button
          type="button"
          disabled={primaryDisabled}
          onClick={handlePrimaryClick}
          className={`h-[45px] rounded-[10px] text-[16px] font-semibold flex-[2] ${
            primaryDisabled
              ? "bg-[#D8D8D8] text-white cursor-not-allowed"
              : "border border-[#B6B6B6] bg-white text-[#3A3A3A]"
          }`}
        >
          {primaryLabel}
        </button>

        <button
          type="button"
          onClick={handleSecondaryClick}
          className="h-[45px] rounded-[10px] border border-[#B6B6B6] text-[16px] font-semibold text-[#3A3A3A] bg-white flex-[3]"
        >
          {secondaryLabel}
        </button>
      </div>
    </section>
  );
}
