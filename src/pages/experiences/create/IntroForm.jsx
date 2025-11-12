import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { BiSolidCamera } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";

export default function IntroForm() {
  const navigate = useNavigate();

  const [programName, setProgramName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);

  const descCount = useMemo(() => `${desc.length} / 50`, [desc]);

  const openPicker = () => {
    if (image) return;
    fileRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = (e.target.files || [])[0];
    if (!file) return;
    const item = { id: `${Date.now()}`, url: URL.createObjectURL(file), file };
    setImage(item);
    e.target.value = "";
  };

  const removeImage = () => setImage(null);

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-white">
          <div className="h-12 relative flex items-center justify-center px-3">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center"
            >
              <IoChevronBack size={22} className="text-[#3A3A3A]" />
            </button>
            <h1 className="text-[15px] font-semibold text-[#3A3A3A]">
              프로그램 소개
            </h1>
          </div>
        </header>

        {/* 본문 */}
        <main className="px-5 pt-12 pb-28">
          <section className="mb-8">
            <h1 className="text-[20px] font-bold text-[#3A3A3A] mb-2">
              프로그램 소개
            </h1>
            <p className="text-[15px] font-medium text-[#969696] leading-[1.4]">
              프로그램을 가장 잘 보여줄 사진과 제목을 입력하고,
              <br />
              어떤 체험인지 간단히 알려주세요.
            </p>
          </section>

          {/* 이미지 0/1 */}
          <section className="mb-8">
            <h3 className="text-[15px] font-medium text-[#3A3A3A] mb-3">
              프로그램 정보 이미지
            </h3>

            <div className="flex items-center gap-3">
              {/* 업로드 버튼 */}
              <button
                type="button"
                onClick={openPicker}
                className="w-[64px] h-[64px] rounded-[5px] border-[2px] border-[#E6E6E6] bg-white flex flex-col items-center justify-center"
              >
                <BiSolidCamera size={26} className="text-[#969696]" />
                <span className="text-[12px] text-[#969696]">
                  {image ? "1/1" : "0/1"}
                </span>
              </button>

              {/* 썸네일 */}
              {image && (
                <div className="relative w-[64px] h-[64px] rounded-[10px] overflow-hidden border border-[#EDEDED]">
                  <img
                    src={image.url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                    aria-label="삭제"
                  >
                    <RxCross2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </section>

          {/* 프로그램명 */}
          <section className="mb-6">
            <h3 className="text-[15px] font-medium text-[#3A3A3A] mb-3">
              프로그램명
            </h3>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="예) 나만의 초콜릿 만들기"
              className="w-full h-11 rounded-[5px] border-[2px] border-[#E6E6E6] px-4 text-[13px] text-[#3A3A3A] placeholder:text-[#B6B6B6] outline-none"
            />
          </section>

          {/* 간단한 설명 */}
          <section>
            <h3 className="text-[15px] font-medium text-[#3A3A3A] mb-2">
              간단한 설명
            </h3>
            <div className="relative">
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 50))}
                placeholder="예) 프리미엄 원두와 견과류, 제철 과일을 활용해 직접 초콜릿을 만들어 보세요."
                rows={4}
                className="w-full h-[70px] rounded-[5px] border-[2px] border-[#E6E6E6] px-4 py-3 text-[13px] text-[#3A3A3A] placeholder:text-[#B6B6B6] outline-none resize-none"
              />
              <div className="text-[12px] mt-1 text-right">
                <span className="text-[#3A3A3A] font-medium">
                  {desc.length}
                </span>
                <span className="text-[#8E8E93]"> / 50</span>
              </div>
            </div>
          </section>
        </main>

        {/* 하단 버튼 영역 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur px-5 pb-6 pt-3">
          <div className="grid grid-cols-[1fr_4fr] gap-2">
            {/* 삭제: 신규 생성 시 비활성화 */}
            <button
              type="button"
              disabled
              className="h-11 rounded-[5px] bg-white border-[2px] border-[#D8D8D8] text-[#C9C9C9] text-[14px] font-semibold disabled:opacity-100"
            >
              삭제
            </button>
            <button
              type="button"
              className="h-11 rounded-[5px] bg-[#F13030] text-white text-[15px] font-bold"
              onClick={() => navigate(-1)} // 우선 저장 후 이전 화면으로 (연동 전)
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
