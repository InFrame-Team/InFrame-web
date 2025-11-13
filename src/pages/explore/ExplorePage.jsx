// src/pages/explore/ExplorePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaSearch } from "react-icons/fa";
import BottomTab from "../../components/BottomTab";
import { IoSearch } from "react-icons/io5";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const scenarioButtons = [
    "친구랑 시험 끝나고 반나절 즐길 체험 추천해줘",
    "오늘은 혼자 조용히 힐링하고 싶어",
    "비 오는 날 어울리는 실내 체험 알려줘",
    "데이트에 감성 있는 클래스 찾아줘",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    navigate(`/explore/result?query=${encodeURIComponent(query.trim())}`);
  };

  const handleScenarioClick = (text) => {
    navigate(`/explore/result?query=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-3 pt-2 pb-3 border-b border-neutral-100">
        <div className="px-2 py-1 flex items-center justify-start">
          <img
            src="/inframe-logo.png"
            alt=""
            className="w-30 h-9 object-contain"
            aria-hidden
          />
        </div>

        <h1 className="text-[18px] font-bold text-[#1D1D1D] mt-8 mb-3 leading-snug">
          상황에 딱 맞는 로컬 체험을 찾아드립니다.
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-[#f4f4f4] rounded-xl px-4 py-2.5 mb-2"
        >
          <input
            type="text"
            placeholder="오늘 하고 싶은 체험이나 기분을 적어주세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-neutral-400"
          />
          <button type="submit">
            <IoSearch className="text-[20px]" />
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {scenarioButtons.map((text) => (
            <button
              key={text}
              onClick={() => handleScenarioClick(text)}
              className="shrink-0 px-3 py-1.5 border border-[#F1F1F1] rounded-full bg-[#FFFFFF] text-[11px] text-[#9D9D9D] text-left"
            >
              {text}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pb-5">
          <div className="px-4 pt-4">
            <div className="rounded-xl bg-[#F8F8F8] border border-[#F0F0F0] px-4 py-3 flex items-start justify-between">
              <p className="text-[13px] font-bold text-[#F13030] mr-3 whitespace-nowrap">
                TIP
              </p>
              <p className="flex-1 text-[13px] text-[#3A3A3A] leading-relaxed">
                &quot;누구랑&quot; &quot;무엇을&quot; &quot;어떻게&quot; 등의
                키워드를 정확하게 입력하면 <br />
                원하는 체험을 쉽게 만나볼 수 있어요!
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed bottom-0 left-0 right-0">
        <BottomTab active="explore" />
      </div>
    </div>
  );
}
