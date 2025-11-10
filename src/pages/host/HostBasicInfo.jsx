import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { MdArrowBackIosNew } from "react-icons/md";
// ❌ 여기서는 이제 updateHost 안 씀
// import { updateHost } from "../../apis/host";

export default function HostBasicInfo() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const businessNumber = state?.businessNumber; // 이전 페이지에서 받은 번호

  const [businessName, setBusinessName] = useState("");
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [kakaoAddress, setKakaoAddress] = useState("");

  const isNextEnabled =
    businessName.trim() !== "" && businessPhoneNumber.trim() !== "";

  const handleNext = () => {
    if (!isNextEnabled) return;

    if (!businessNumber) {
      alert("사업자 번호 정보가 없습니다. 처음 단계부터 다시 진행해주세요.");
      navigate("/host/business-number");
      return;
    }

    // ✅ 여기서는 API 호출 안 하고, 다음 페이지로 값들 넘기기만 함
    navigate("/host/profile-settings", {
      state: {
        businessNumber,
        businessName: businessName.trim(),
        businessPhoneNumber: businessPhoneNumber.trim(),
        businessEmail: businessEmail.trim() || null,
        kakaoAddress: kakaoAddress.trim() || null,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 */}
      <header className="pt-4 px-4 flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="text-xl">
          <MdArrowBackIosNew />
        </button>

        <div className="flex justify-center flex-1">
          <div className="relative w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-1/3 h-full bg-[#e64a45] rounded-full" />
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="px-6 flex-1 mt-16">
        <h1 className="text-[22px] font-bold mb-8">기본 정보를 입력하세요</h1>

        {/* 사업자 명 */}
        <div className="mb-8">
          <label className="block text-[14px] text-neutral-800 mb-2">
            사업자 명<span className="text-[#e64a45]"> *</span>
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border-b border-neutral-200 text-[16px] pb-2 outline-none"
          />
        </div>

        {/* 고객센터 전화번호 */}
        <div className="mb-8">
          <label className="block text-[14px] text-neutral-800 mb-2">
            고객센터 전화번호<span className="text-[#e64a45]"> *</span>
          </label>
          <input
            type="tel"
            value={businessPhoneNumber}
            onChange={(e) => setBusinessPhoneNumber(e.target.value)}
            className="w-full border-b border-neutral-200 text-[16px] pb-2 outline-none"
          />
        </div>

        {/* 고객센터 이메일 */}
        <div className="mb-8">
          <label className="block text-[14px] text-neutral-800 mb-2">
            고객센터 이메일
          </label>
          <input
            type="email"
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
            className="w-full border-b border-neutral-200 text-[16px] pb-2 outline-none"
          />
        </div>

        {/* 카카오톡 채널 주소 */}
        <div className="mb-8">
          <label className="block text-[14px] text-neutral-800 mb-2">
            카카오톡 채널 주소
          </label>
          <input
            type="text"
            value={kakaoAddress}
            onChange={(e) => setKakaoAddress(e.target.value)}
            className="w-full border-b border-neutral-200 text-[16px] pb-2 outline-none"
          />
        </div>
      </main>

      {/* 하단 버튼 */}
      <div className="px-4 pb-8">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isNextEnabled}
          className={`w-full h-12 rounded-xl text-[15px] font-semibold ${
            isNextEnabled
              ? "bg-[#e64a45] text-white"
              : "bg-neutral-300 text-white"
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
