import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomTab from "../../components/BottomTab";
import doorImg from "../../assets/door.png";

export default function RegisterHost() {
  const navigate = useNavigate();
  const [role, setRole] = useState("host");

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <header className="pt-5 flex justify-center">
        <div className="flex bg-neutral-100 rounded-full p-1">
          <button
            onClick={() => setRole("participant")}
            className={`px-5 py-2 rounded-full text-[15px] font-medium transition-all ${
              role === "participant"
                ? "bg-[#3a3a3a] text-white shadow-sm"
                : "bg-transparent text-[#a3a3a3]"
            }`}
          >
            참여자
          </button>
          <button
            onClick={() => setRole("host")}
            className={`px-5 py-2 rounded-full text-[15px] font-medium transition-all ${
              role === "host"
                ? "bg-[#3a3a3a] text-white shadow-sm"
                : "bg-transparent text-[#a3a3a3]"
            }`}
          >
            호스트
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 mt-14 relative">
        {role === "host" ? (
          <>
            <p className="text-[15px] text-[#7C7C7F] mb-2">
              당신의 이야기를 나눌 준비가 되셨나요?
            </p>
            <h1 className="text-[24px] font-bold leading-snug">
              지금 로컬 호스트로
              <br />
              함께하세요.
            </h1>

            <img
              src={doorImg}
              alt="호스트 가입 이미지"
              className="absolute right-6 bottom-[20px] w-[200px] select-none pointer-events-none"
            />
          </>
        ) : (
          <div className="flex justify-center items-center text-neutral-400 text-[14px] h-full">
            참여자 페이지는 준비 중입니다.
          </div>
        )}
      </main>

      {role === "host" && (
        <div className="px-6 pb-36 flex justify-end">
          <button
            onClick={() => navigate("/host/business-number")}
            className="bg-[#F13030] text-white py-3 px-6 rounded-full shadow-md text-[15px] font-semibold"
          >
            호스트 가입
          </button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0">
        <BottomTab active="me" />
      </div>
    </div>
  );
}
