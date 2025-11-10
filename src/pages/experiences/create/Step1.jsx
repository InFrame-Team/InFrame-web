import React, { useEffect, useMemo, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import fakeProfile from "../../../assets/fakeProfile.svg";
import StepHeader from "../../../components/experience_create/StepHeader";
import CategorySheet from "../../../components/experience_create/CategorySheet";
import categoryIcon1 from "../../../assets/categoryIcon1.png";
import categoryIcon2 from "../../../assets/categoryIcon2.png";
import categoryIcon3 from "../../../assets/categoryIcon3.png";
import categoryIcon4 from "../../../assets/categoryIcon4.png";
import {
  fetchCategoryEnums,
  fetchProfessionalFields,
  fetchDetailFields,
} from "../../../apis/enums";
import FieldSheet from "../../../components/experience_create/FieldSheet";

function HostCard() {
  return (
    <div className="flex items-center h-[102px] gap-3 p-4 border-[2px] border-[#E6E6E6] rounded-[10px]">
      <div className="w-[72px] h-[72px] rounded-full bg-[#FFEFEF] flex items-center justify-center text-xl">
        <img src={fakeProfile} />
      </div>

      <div className="flex-1 ml-2">
        <p className="text-[18px] font-bold text-[#3A3A3A]">이지섭 호스트</p>
        <p className="text-[13px] font-medium text-[#A0A0A0] mt-1">
          흙을 담아 삶의 이야기를 빚어냅니다.
        </p>
      </div>
    </div>
  );
}

function DropdownButton({
  label,
  value,
  placeholder = "선택",
  disabled,
  onClick,
}) {
  const display = value || placeholder;
  const isPlaceholder = !value;

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-[14px] font-semibold text-[#3A3A3A]">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`w-full h-[46px] px-3 rounded-[5px] border-[2px] text-left text-[14px] flex items-center justify-between ${
          disabled
            ? "bg-[#F7F7F9] text-[#B9B9C1] border-[#F0F0F3] cursor-not-allowed"
            : "bg-white text-[#3A3A3A] border-[#E7E7EA]"
        }`}
      >
        <span
          className={`${
            isPlaceholder ? "text-[#969696]" : "text-[#3A3A3A]"
          } text-[15px] font-medium`}
        >
          {display}
        </span>
        <IoChevronDown
          size={18}
          className={`${disabled ? "text-[#D1D1D6]" : "text-[#D4D4D4]"}`}
        />
      </button>
    </div>
  );
}

function TagInputSkeleton() {
  return (
    <div className="w-full">
      <label className="block mb-4 text-[20px] font-bold text-[#3A3A3A]">
        보유한 자격증을 작성해주세요.
      </label>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-[46px] px-3 rounded-[5px] border-[2px] border-[#E6E6E6] bg-white flex items-center justify-between">
          <input
            disabled
            placeholder="추가해 주세요."
            className="w-full bg-transparent outline-none text-[15px] font-medium text-[#969696] placeholder:text-[#969696]"
          />
          <span className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[#D4D4D4] text-[20px] cursor-pointer">
            +
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Step1() {
  const [categoryId, setCategoryId] = useState(null);
  const [specialtyId, setSpecialtyId] = useState(null);
  const [subId, setSubId] = useState(null);

  const [openCategory, setOpenCategory] = useState(false);
  const [openSpecialty, setOpenSpecialty] = useState(false);
  const [openSub, setOpenSub] = useState(false);

  // 카테고리 API
  const [categories, setCategories] = useState([]);
  const iconMap = {
    MASTER_ARTISAN: categoryIcon1,
    YOUNG_ENTREPRENEUR: categoryIcon2,
    LOCAL_MERCHANT: categoryIcon3,
    ARTIST: categoryIcon4,
  };

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const data = await fetchCategoryEnums(controller.signal);
        const mapped = (Array.isArray(data) ? data : []).map((item, idx) => ({
          id: item.code,
          label: item.description,
          icon:
            iconMap[item.code] ||
            [categoryIcon1, categoryIcon2, categoryIcon3, categoryIcon4][
              idx % 4
            ],
        }));
        setCategories(mapped);
      } catch (e) {
        if (e?.name !== "CanceledError") {
          console.error("카테고리 불러오기 실패:", e);
          setCategories([]);
        }
      }
    })();
    return () => controller.abort();
  }, []);

  // 전문 분야 API
  const [specialties, setSpecialties] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const data = await fetchProfessionalFields(controller.signal);
        const mapped = (Array.isArray(data) ? data : []).map((item) => ({
          id: item.code,
          label: item.description,
        }));
        setSpecialties(mapped);
      } catch (e) {
        if (e?.name !== "CanceledError")
          console.error("전문 분야 불러오기 실패:", e);
      }
    })();
    return () => controller.abort();
  }, []);

  // 상세 분야 API
  const [detailFields, setDetailFields] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const data = await fetchDetailFields(controller.signal);
        const mapped = (Array.isArray(data) ? data : []).map((item) => ({
          id: item.code,
          label: item.description,
        }));
        setDetailFields(mapped);
      } catch (e) {
        if (e?.name !== "CanceledError")
          console.error("상세 분야 불러오기 실패:", e);
      }
    })();
    return () => controller.abort();
  }, []);

  const categoryLabel = useMemo(
    () => categories.find((v) => v.id === categoryId)?.label || "",
    [categories, categoryId]
  );
  const specialtyLabel =
    specialties.find((v) => v.id === specialtyId)?.label || "";
  const subLabel = detailFields.find((v) => v.id === subId)?.label || "";
  const canNext = !!(categoryId && specialtyId && subId);

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px]">
        <StepHeader onBack={() => history.back()} currentStep={1} />

        <main className="px-5 pb-28">
          <HostCard />

          <section className="mt-8 space-y-7">
            <div>
              <p className="mb-4 text-[20px] font-bold text-[#3A3A3A]">
                분야 카테고리를 선택해주세요.
              </p>
              <DropdownButton
                value={categoryLabel}
                placeholder="카테고리 선택"
                onClick={() => setOpenCategory(true)}
              />
            </div>

            <div>
              <p className="mb-4 text-[20px] font-bold text-[#3A3A3A]">
                전문 분야 및 상세 분야를
                <br />
                선택해주세요.
              </p>
              <div className="space-y-2">
                <DropdownButton
                  value={specialtyLabel}
                  placeholder="전문 분야"
                  onClick={() => setOpenSpecialty(true)}
                />
                <DropdownButton
                  value={subLabel}
                  placeholder="상세 분야"
                  onClick={() => setOpenSub(true)}
                />
              </div>
            </div>

            <TagInputSkeleton />
          </section>
        </main>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3 border-t border-[#EEE]">
          <button
            type="button"
            disabled={!canNext}
            className={`w-full h-[48px] rounded-[10px] text-[16px] font-bold ${
              canNext
                ? "bg-[#3A3A3A] text-white"
                : "bg-[#EDEDED] text-[#B1B1B1] cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>
      </div>

      {/* 카테고리 시트 */}
      <CategorySheet
        open={openCategory}
        title="카테고리를 선택해주세요."
        options={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
        onApply={(selected) => {
          setCategoryId(selected?.id ?? null);
          setOpenCategory(false);
        }}
        onClose={() => setOpenCategory(false)}
      />

      {/* 전문 분야 시트 */}
      <FieldSheet
        open={openSpecialty}
        title="전문 분야를 선택해주세요."
        options={specialties}
        selectedId={specialtyId}
        onSelect={setSpecialtyId}
        onNext={() => setOpenSpecialty(false)}
        onClose={() => setOpenSpecialty(false)}
      />

      {/* 상세 분야 시트 */}
      <FieldSheet
        open={openSub}
        title="상세 분야를 선택해주세요."
        options={detailFields}
        selectedId={subId}
        onSelect={setSubId}
        onNext={() => setOpenSub(false)}
        onClose={() => setOpenSub(false)}
      />
    </div>
  );
}
