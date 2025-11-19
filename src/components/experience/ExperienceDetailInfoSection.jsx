import React from "react";
import { MdLocationOn } from "react-icons/md";
import { IoIosCall } from "react-icons/io";
import ExperienceReviewSection from "./ExperienceReviewSection";

export default function ExperienceDetailInfoSection({
  location,
  phoneNumber,
  experienceId,
  totalReviewCount,
}) {
  return (
    <div className="pb-10 space-y-8">
      {/* 장소 */}
      <section className="pt-6">
        <h2 className="text-[20px] font-bold text-[#3A3A3A] mb-3">장소</h2>

        {/* 지도 영역 (추후 실제 지도 연동) */}
        <div className="w-full h-[170px] rounded-[10px] bg-[#F5F5F5] mb-5 flex items-center justify-center">
          <span className="text-[12px] text-[#B0B0B0]">
            지도가 들어갈 예정입니다.
          </span>
        </div>

        {/* 주소 */}
        <div className="flex items-center gap-2 mb-2">
          <MdLocationOn className="w-[16px] h-[16px] text-[#C9C9C9]" />
          <span className="text-[15px] font-semibold text-[#555558]">
            {location || "주소 정보가 없습니다."}
          </span>
        </div>

        {/* 연락처 */}
        <div className="flex items-center gap-2 mb-4">
          <IoIosCall className="w-[16px] h-[16px] text-[#C9C9C9]" />
          <span className="text-[15px] font-semibold text-[#555558]">
            {phoneNumber || "연락처 정보가 없습니다."}
          </span>
        </div>

        {/* 길찾기 버튼 */}
        <button
          type="button"
          className="w-full h-[35px] mt-1 rounded-[5px] border border-[#E9E9EC] text-[14px] font-medium text-[#3A3A3A]"
        >
          길찾기
        </button>
      </section>

      {/* 리뷰 섹션 */}
      <ExperienceReviewSection
        experienceId={experienceId}
        totalReviewCount={totalReviewCount}
      />
    </div>
  );
}
