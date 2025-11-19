import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function formatDateTimeKorean(isoString) {
  if (!isoString) return "-";

  const d = new Date(isoString);
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const day = days[d.getDay()];

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const meridiem = hours < 12 ? "오전" : "오후";
  let displayHour = hours % 12;
  if (displayHour === 0) displayHour = 12;

  const minuteStr = String(minutes).padStart(2, "0");

  return `${year}년 ${month}월 ${date}일 (${day}) · ${meridiem} ${displayHour}:${minuteStr}`;
}

export default function ReservationCancelDonePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reservation = location.state?.reservation;

  // state 없이 직접 들어온 경우: 목록으로 보내기
  if (!reservation) {
    navigate("/my/reservations");
    return null;
  }

  const { experienceTitle, title, reservedStartTime, totalParticipants } =
    reservation;

  const displayedTitle = experienceTitle || title || "";

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col">
        <main className="flex-1 px-5 pt-28 pb-24">
          <h1 className="text-[26px] font-bold text-[#222222] mb-1">
            예약이 취소되었어요
          </h1>
          <p className="text-[15px] font-medium text-[#A0A0A0] mb-8">
            다음 만남을 기약할게요!
          </p>

          {/* 예약 요약 카드 */}
          <section className="rounded-[10px] border border-[#F0F0F0] bg-white px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
            <dl className="grid grid-cols-[80px_auto] gap-y-2 text-[15px] font-medium">
              <dt className="text-[#969696]">클래스명</dt>
              <dd className="text-[#3A3A3A]">{displayedTitle}</dd>

              <dt className="text-[#969696]">일시</dt>
              <dd className="text-[#3A3A3A]">
                {formatDateTimeKorean(reservedStartTime)}
              </dd>

              <dt className="text-[#969696]">예약 인원</dt>
              <dd className="text-[#3A3A3A]">{totalParticipants}명</dd>
            </dl>
          </section>
        </main>

        {/* 하단 확인 버튼 */}
        <footer className="px-5 pb-6">
          <button
            type="button"
            onClick={() => navigate("/my/reservations")}
            className="w-full h-[48px] rounded-[8px] bg-[#F13030] text-white text-[15px] font-semibold"
          >
            확인
          </button>
        </footer>
      </div>
    </div>
  );
}
