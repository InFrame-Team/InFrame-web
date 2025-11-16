import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoSearch } from "react-icons/io5";
import ReservationCard from "../../components/reservation/ReservationCard";

const MOCK_RESERVATIONS = [
  {
    id: 1,
    dateLabel: "2025년 10월 21일 (화)",
    reservationDate: "2025-12-20",
    status: "예약상세",
    hostName: "이서윤 호스트",
    title: "감성 도자기 원데이 클래스",
    amount: 50000,
    avatarBg: "#FFEFEF",
  },
  {
    id: 2,
    dateLabel: "2025년 10월 11일 (토)",
    reservationDate: "2025-10-11",
    status: "예약상세",
    hostName: "최하늘 호스트",
    title: "힐링 캔들 클래스",
    amount: 40000,
    avatarBg: "#FFF5E5",
  },
  {
    id: 3,
    dateLabel: "2025년 9월 21일 (일)",
    reservationDate: "2025-09-21",
    status: "예약상세",
    hostName: "차혜윤 호스트",
    title: "마카롱과 쿠키를 직접 구워보는 시간",
    amount: 40000,
    avatarBg: "#E9F5FF",
  },
];

export default function ReservationHistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative overflow-hidden flex flex-col">
        {/* 상단 헤더 + 검색 */}
        <header className="sticky top-0 z-10 bg-white">
          {/* 타이틀 */}
          <div className="h-12 flex items-center px-3 border-b border-[#F1F1F1]">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center"
            >
              <IoChevronBack size={22} className="text-[#3A3A3A]" />
            </button>
            <h1 className="flex-1 text-center text-[16px] font-semibold text-[#222]">
              예약내역
            </h1>
            {/* 우측 공간 맞추기 */}
            <div className="w-9 h-9" />
          </div>

          {/* 검색창 */}
          <div className="px-5 py-3">
            <div className="relative h-[40px] rounded-full bg-[#EFEFEF]">
              <input
                type="text"
                placeholder="호스트나 프로그램 이름을 검색해보세요"
                className="absolute inset-y-0 left-5 right-10 bg-transparent text-[14px] font-medium text-[#3A3A3A] placeholder:text-[#7E8082] outline-none"
              />
              <IoSearch
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4E4E51]"
              />
            </div>
          </div>
        </header>

        {/* 하단 내역 영역 */}
        <main className="flex-1 bg-[#F5F5F5]">
          <div className="px-5 pt-3 pb-6 space-y-3">
            {MOCK_RESERVATIONS.map((item) => (
              <ReservationCard key={item.id} reservation={item} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
