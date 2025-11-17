import React, { useState } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import fakeProfile2 from "../../assets/fakeProfile2.png";

function getDateDiffInDays(reservationDate) {
  if (!reservationDate) return null;
  const today = new Date();
  const target = new Date(reservationDate);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getMeetSubtitleFromDiff(diffDays) {
  if (diffDays === null) return "";
  if (diffDays > 0) return `${diffDays}일 후에 만나요`;
  if (diffDays === 0) return "오늘 만나요";
  return `${Math.abs(diffDays)}일 전에 만났어요`;
}

export default function ReservationCard({ reservation, onClickReview }) {
  const [liked, setLiked] = useState(false);
  const {
    id, // 예약 id (reservationId)
    dateLabel,
    status,
    hostName,
    reservationDate,
    title,
    amount,
    avatarBg = "#FFEFEF",
  } = reservation;

  const diffDays = getDateDiffInDays(reservationDate);
  const subtitleText = getMeetSubtitleFromDiff(diffDays);
  const isUpcoming = diffDays !== null && diffDays > 0;

  const primaryLabel = isUpcoming ? "길찾기" : "후기 작성";
  const secondaryLabel = isUpcoming
    ? "호스트에게 연락하기"
    : "같은 곳으로 예약하기";

  return (
    <section className="w-full bg-white rounded-[10px] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* 상단 날짜 + 상태 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-medium text-[#A0A0A0]">{dateLabel}</p>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F6F6F6] text-[12px] text-[#7E8082] font-medium">
          {status}
        </span>
      </div>

      {/* 호스트 정보 + 하트 */}
      <div className="flex items-start justify-between mt-1 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={fakeProfile2}
            alt={hostName}
            className="w-[55px] h-[55px] rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-[20px] font-bold text-[#3A3A3A]">
              {hostName}
            </span>
            <span className="text-[14px] font-medium text-[#3A3A3A]">
              {subtitleText}
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
        <span className="text-[16px] font-bold text-[#3A3A3A]">
          {amount.toLocaleString()}원
        </span>
      </div>

      {/* 버튼 2개 (2:3 비율) */}
      <div className="flex gap-2 mt-3 mb-1">
        <button
          type="button"
          className="h-[45px] rounded-[10px] border border-[#B6B6B6] text-[16px] font-semibold text-[#3A3A3A] bg-white flex-[2]"
          onClick={!isUpcoming ? onClickReview : undefined}
        >
          {primaryLabel}
        </button>

        <button
          type="button"
          className="h-[45px] rounded-[10px] border border-[#B6B6B6] text-[16px] font-semibold text-[#3A3A3A] bg-white flex-[3]"
        >
          {secondaryLabel}
        </button>
      </div>
    </section>
  );
}
