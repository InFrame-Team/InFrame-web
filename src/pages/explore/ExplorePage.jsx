// src/pages/explore/ExplorePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import BottomTab from "../../components/BottomTab";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const scenarioButtons = [
    "오늘 하고 싶은 체험이나 기분을 적어보세요",
    "친구랑 시험 끝나고 감성 있게 즐기고 싶은 체험",
    "친구랑 도자기 관련해서 만나러 즐길 체험 추천해줘",
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
      <header className="px-4 pt-4 pb-3 border-b border-neutral-100">
        <div className="flex items-center mb-4">
          <img
            src="/inframe-logo.png"
            alt="in경산 로고"
            className="h-6 object-contain"
          />
        </div>

        <h1 className="text-[18px] font-semibold text-[#1D1D1D] mb-3 leading-snug">
          상황에 딱 맞는 로컬 체험을 찾아드릴게요.
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-[#f4f4f4] rounded-full px-4 py-2.5 mb-2"
        >
          <input
            type="text"
            placeholder="오늘 하고 싶은 체험이나 기분을 적어주세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1D1D1D]"
          >
            <FaSearch className="text-white text-[13px]" />
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {scenarioButtons.map((text) => (
            <button
              key={text}
              onClick={() => handleScenarioClick(text)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-[#f4f4f4] text-[11px] text-neutral-700 text-left"
            >
              {text}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        <section className="px-4 pt-4">
          <div className="rounded-2xl bg-[#fff5f4] px-4 py-3">
            <p className="text-[11px] font-semibold text-[#e64a45] mb-1">TIP</p>
            <p className="text-[12px] text-[#3A3A3A] leading-relaxed">
              &quot;누구랑&quot; &quot;무엇을&quot; &quot;어떻게&quot;를
              조합하면 <br />더 취향에 맞는 체험을 쉽게 만날 수 있어요.
            </p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0">
        <BottomTab active="explore" />
      </div>
    </div>
  );
}
