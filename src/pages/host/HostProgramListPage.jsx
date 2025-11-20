import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import HostProgramCard from "../../components/host/HostProgramCard";
import fakeImg from "../../assets/fakeImg.svg";

const mockPrograms = [
  {
    id: 1,
    mainImageUrl: fakeImg,
    price: 50000,
    title: "한 입의 예술, 핸드메이드 초콜릿 클래스",
    durationInHours: "1시간",
    rating: 4.88,
  },
  {
    id: 2,
    mainImageUrl: fakeImg,
    price: 35000,
    title: "입문자를 위한 '카카오의 이해' 워크숍",
    durationInHours: "1시간 30분",
    rating: 4.25,
  },
  {
    id: 3,
    mainImageUrl: fakeImg,
    price: 60000,
    title: "빵기에 스타일! 5년 경력 쇼콜라티에의 비밀 레시피",
    durationInHours: "2시간",
    rating: 4.15,
  },
];

export default function HostProgramListPage() {
  const navigate = useNavigate();
  const { hostId } = useParams();

  const programs = mockPrograms; // 나중에 API 연동

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] bg-white pb-4">
        {/* 상단 헤더 */}
        <header className="h-12 flex items-center px-4 border-b border-[#F2F2F2]">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center"
          >
            <IoChevronBack size={22} className="text-[#3A3A3A]" />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-semibold text-[#3A3A3A] mr-9">
            {programs.length}개의 프로그램
          </h1>
        </header>

        {/* 리스트 */}
        <main className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {programs.map((p) => (
              <HostProgramCard
                key={p.id}
                mainImageUrl={p.mainImageUrl}
                title={p.title}
                price={p.price}
                durationInHours={p.durationInHours}
                rating={p.rating}
                onClick={() => {
                  navigate(`/experiences/${p.id}`);
                }}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
