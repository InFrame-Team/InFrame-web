import React, { useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { IoMdTime } from "react-icons/io";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import fakeImg from "../../assets/fakeImg.svg";
import { toggleExperienceLike } from "../../apis/likes";

export default function HostProgramCard({
  experienceId,
  mainImageUrl,
  title,
  price,
  durationInHours,
  rating,
  isLiked,
  onClick,
}) {
  const imgSrc = mainImageUrl || fakeImg;

  const [liked, setLiked] = useState(!!isLiked);

  useEffect(() => {
    setLiked(!!isLiked);
  }, [isLiked]);

  const handleHeartClick = async (e) => {
    e.stopPropagation();

    if (!experienceId) return;

    try {
      await toggleExperienceLike(experienceId);
      setLiked((prev) => !prev);
    } catch (error) {
      console.error("하트 토글 실패:", error);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="text-left w-full cursor-pointer"
    >
      {/* 이미지 영역 */}
      <div className="relative w-full rounded-[5px] overflow-hidden mb-2.5">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-[200px] object-cover"
        />

        {/* 하트 아이콘 */}
        <div
          onClick={handleHeartClick}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
        >
          {liked ? (
            <FaHeart size={20} className="text-[#F13030]" />
          ) : (
            <FaRegHeart size={20} className="text-white/90" />
          )}
        </div>
      </div>

      {/* 가격 */}
      <p className="text-[16px] font-bold text-[#3A3A3A] mb-1">
        {price?.toLocaleString()}원
      </p>

      {/* 제목 */}
      <p className="text-[14px] font-medium text-[#6D6D6D] line-clamp-1">
        {title}
      </p>

      {/* 하단 메타 정보 */}
      <div className="flex items-center justify-between gap-3 mt-1 text-[12px] text-[#A0A0A0] font-medium">
        {durationInHours && (
          <span className="flex items-center gap-0.5">
            <IoMdTime className="text-[#D9D9D9]" />
            <span>{durationInHours}</span>
          </span>
        )}

        {rating != null && (
          <span className="flex items-center gap-0.5">
            <AiFillStar size={12} className="text-[#D9D9D9]" />
            <span>{rating.toFixed(2)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
