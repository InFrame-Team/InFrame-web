// src/pages/host/HostBasicInfo.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import CategorySheet from "../../components/experience_create/CategorySheet";

import categoryIcon1 from "../../assets/categoryIcon1.png";
import categoryIcon2 from "../../assets/categoryIcon2.png";
import categoryIcon3 from "../../assets/categoryIcon3.png";
import categoryIcon4 from "../../assets/categoryIcon4.png";

const CATEGORY_OPTIONS = [
  {
    id: "MASTER_ARTISAN",
    label: "장인/명인",
    icon: categoryIcon1,
  },
  {
    id: "YOUNG_ENTREPRENEUR",
    label: "청년사업가",
    icon: categoryIcon2,
  },
  {
    id: "LOCAL_MERCHANT",
    label: "골목상인",
    icon: categoryIcon3,
  },
  {
    id: "ARTIST",
    label: "예술가",
    icon: categoryIcon4,
  },
];

export default function HostBasicInfo() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const businessNumber = state?.businessNumber;

  // 분야 카테고리
  const [categoryId, setCategoryId] = useState(null);
  const [categoryLabel, setCategoryLabel] = useState("");
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  // 기본 정보
  const [businessName, setBusinessName] = useState("");
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [kakaoAddress, setKakaoAddress] = useState("");

  // 다음 버튼 활성화 조건: 카테고리 + 필수 입력 2개
  const isNextEnabled =
    !!categoryId &&
    businessName.trim() !== "" &&
    businessPhoneNumber.trim() !== "" &&
    businessEmail.trim() !== "" &&
    kakaoAddress.trim() !== "";

  const handleNext = () => {
    if (!isNextEnabled) return;

    if (!businessNumber) {
      alert("사업자 번호 정보가 없습니다. 처음 단계부터 다시 진행해주세요.");
      navigate("/host/business-number");
      return;
    }

    navigate("/host/profile-settings", {
      state: {
        businessNumber,
        category: categoryId, // ✅ 선택한 분야 카테고리 코드
        businessName: businessName.trim(),
        businessPhoneNumber: businessPhoneNumber.trim(),
        businessEmail: businessEmail.trim() || null,
        kakaoAddress: kakaoAddress.trim() || null,
      },
    });
  };

  const handleCategoryApply = (selected) => {
    if (!selected) return;
    setCategoryId(selected.id);
    setCategoryLabel(selected.label);
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] relative pb-24">
        {/* 상단 */}
        <header className="pt-4 px-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xl"
          >
            <MdArrowBackIosNew />
          </button>

          <div className="flex justify-center flex-1">
            <div className="relative w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
              {/* 진행바 가운데 붉은 부분 */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-1/3 h-full bg-[#e64a45] rounded-full" />
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main className="px-6 flex-1 mt-10">
          <h1 className="text-[22px] font-bold mb-8">기본 정보를 입력하세요</h1>

          {/* 분야 카테고리 */}
          <div className="mb-8">
            <label className="block text-[14px] text-neutral-800 mb-2">
              분야 카테고리<span className="text-[#e64a45]"> *</span>
            </label>
            <button
              type="button"
              onClick={() => setCategorySheetOpen(true)}
              className="w-full h-12 px-3 flex items-center justify-between border border-[#E6E6E6] rounded-[8px] bg-white text-left text-[15px]"
            >
              <span
                className={categoryId ? "text-[#3A3A3A]" : "text-[#969696]"}
              >
                {categoryId ? categoryLabel : "장인/명인을 선택해주세요"}
              </span>
              <span className="text-[#969696] text-[24px]">
                <MdOutlineKeyboardArrowDown />
              </span>
            </button>
          </div>

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
              고객센터 이메일<span className="text-[#e64a45]"> *</span>
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
              카카오톡 채널 주소<span className="text-[#e64a45]"> *</span>
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
                ? "bg-[#3A3A3A] text-white"
                : "bg-neutral-300 text-white"
            }`}
          >
            다음
          </button>
        </div>

        {/* 분야 카테고리 선택 시트 */}
        <CategorySheet
          open={categorySheetOpen}
          title="카테고리를 선택해주세요."
          options={CATEGORY_OPTIONS}
          selectedId={categoryId}
          onSelect={setCategoryId}
          onApply={handleCategoryApply}
          onClose={() => setCategorySheetOpen(false)}
        />
      </div>
    </div>
  );
}
