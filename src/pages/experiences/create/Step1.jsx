import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronDown } from "react-icons/io5";
import fakeProfile from "../../../assets/fakeProfile.svg";
import StepHeader from "../../../components/experience_create/StepHeader";
import {
  fetchProfessionalFields,
  fetchDetailFields,
} from "../../../apis/enums";
import FieldSheet from "../../../components/experience_create/FieldSheet";
import { fetchMyHostProfile } from "../../../apis/host";
import { useExperienceCreate } from "../../../contexts/ExperienceCreateContext";

/** 전문 분야별 상세 분야 코드 매핑 */
const DETAIL_FIELD_MAP = {
  CRAFT_CREATION: [
    "CERAMIC_CRAFT", // 도자기 공예
    "LEATHER_CRAFT", // 가죽 공예
    "METAL_SILVER_CRAFT", // 금속/은공예
    "SOAP_CANDLE_DIFFUSER", // 비누/캔들/디퓨저 제작
    "WOOD_CRAFT", // 목공예
    "DRAWING_WATERCOLOR", // 드로잉/수채화
    "PERFUME_MAKING", // 향수 만들기
    "KNITTING_EMBROIDERY", // 뜨개/자수 클래스
  ],

  FOOD_DESSERT: [
    "KOREAN_FOOD", // 한식
    "WESTERN_FUSION", // 양식/퓨전
    "BAKING", // 베이킹
    "CAKE", // 케이크
    "CHOCOLATE", // 초콜릿
    "COFFEE_BEVERAGE", // 커피/음료
    "ALCOHOL", // 주류
  ],

  FLOWER_GARDENING: [
    "FLOWER_GARDENING", // 플라워 가드닝
    "FLOWER_ARRANGEMENT", // 꽃꽂이
    "BOUQUET", // 부케
    "DRY_FLOWER", // 드라이플라워
    "PLANT_CARE", // 식물 관리
    "TERRARIUM", // 테라리움
    "GARDENING", // 가드닝
    "HORTICULTURAL_THERAPY", // 원예치료
    "PLANT_DESIGN", // 식물 디자인
  ],

  CULTURE_TRADITION: [
    "TEA_CEREMONY", // 다도
    "HANBOK", // 한복
    "TRADITIONAL_KNOT", // 전통 매듭
    "KOREAN_FOLK_PAINTING", // 한국화/민화
    "CALLIGRAPHY", // 서예
    "TRADITIONAL_LIQUOR", // 전통주
    "ARCHITECTURE", // 건축
    "GUGAK", // 국악
  ],

  MUSIC_ART: [
    "INSTRUMENT_LESSON", // 악기 레슨
    "VOCAL_TRAINING", // 보컬
    "DRAWING_CLASS", // 드로잉
    "OIL_PAINTING", // 유화/페인팅
    "MUSICAL_THEATER", // 뮤지컬/연극
  ],

  LIFE_HEALING: [
    "YOGA_PILATES", // 요가/필라테스
    "MEDITATION", // 명상
    "PERSONAL_COLOR", // 퍼스널컬러
    "PERFUME", // 향수
    "TARO_SAJU", // 타로/사주
    "ORGANIZING_STORAGE", // 정리수납
    "FINANCIAL_TECH", // 재테크
    "HOBBY_DANCE", // 취미 댄스
  ],

  LOCAL_TOUR: [
    "HISTORY_TOUR", // 역사 투어
    "GOURMET_TOUR", // 맛집 투어
    "TREKKING_HIKING", // 트레킹/등산
    "CAMPING_OUTDOOR", // 캠핑/아웃도어
    "LOCAL_SPECIALTY_EXPERIENCE", // 특산품 체험
    "BICYCLE", // 자전거
    "CITY_WALK", // 시티워크
    "RURAL_STAY", // 농어촌 스테이
  ],

  PHOTO_CONTENT: [
    "SMARTPHONE_PHOTOGRAPHY", // 스마트폰 사진
    "PORTRAIT_PHOTOGRAPHY", // 인물 사진
    "SNS_MARKETING", // SNS 마케팅
    "YOUTUBE_SHORTFORM", // 유튜브/숏폼
    "WRITING", // 글쓰기
    "PHOTOSHOP", // 포토샵
    "WEBTOON_EMOTICON", // 웹툰/이모티콘
    "DRONE_PHOTOGRAPHY", // 드론 촬영
  ],
};

function HostCard({ host, loading }) {
  const { hostName, profileImageUrl, description } = host || {};

  const nameText =
    hostName || (loading ? "호스트 정보를 불러오는 중..." : "호스트 이름");
  const descText =
    description || (loading ? "" : "호스트 소개가 아직 등록되지 않았습니다.");
  const imgSrc = profileImageUrl || fakeProfile;

  return (
    <div className="flex items-center h-[102px] gap-3 p-4 border-[2px] border-[#E6E6E6] rounded-[10px]">
      <div className="w-[72px] h-[72px] rounded-full bg-[#FFEFEF] flex items-center justify-center text-xl">
        <img
          src={imgSrc}
          alt="host profile"
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      <div className="flex-1 ml-2">
        <p className="text-[18px] font-bold text-[#3A3A3A]">{nameText}</p>
        {descText && (
          <p className="text-[13px] font-medium text-[#A0A0A0] mt-1">
            {descText}
          </p>
        )}
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

function TagInputSkeleton({ onAdd }) {
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
          <button
            type="button"
            aria-label="자격증 추가"
            onClick={onAdd}
            className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[#D4D4D4] text-[20px]"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Step1() {
  const navigate = useNavigate();
  const { update, data } = useExperienceCreate();

  const [specialtyId, setSpecialtyId] = useState(
    data.professionalField ?? null
  );
  const [subId, setSubId] = useState(data.detailField ?? null);

  const [openSpecialty, setOpenSpecialty] = useState(false);
  const [openSub, setOpenSub] = useState(false);

  const [host, setHost] = useState(null);
  const [hostLoading, setHostLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const data = await fetchMyHostProfile(controller.signal);
        setHost(data);
      } catch (e) {
        if (e?.name !== "CanceledError") {
          console.error("호스트 정보 불러오기 실패:", e);
        }
      } finally {
        setHostLoading(false);
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

  /** 전문 분야 선택값에 따라 상세 분야 필터링 */
  const filteredDetailFields = useMemo(() => {
    if (!specialtyId) return detailFields;

    const allowedCodes = DETAIL_FIELD_MAP[specialtyId];
    if (!allowedCodes) return detailFields;

    return detailFields.filter((item) => allowedCodes.includes(item.id));
  }, [specialtyId, detailFields]);

  /** 전문 분야 바뀔 때, 현재 선택된 상세 분야가 유효하지 않으면 초기화 */
  useEffect(() => {
    if (!specialtyId || !subId) return;
    const allowedCodes = DETAIL_FIELD_MAP[specialtyId];
    if (!allowedCodes) return;
    if (!allowedCodes.includes(subId)) {
      setSubId(null);
    }
  }, [specialtyId, subId]);

  const specialtyLabel =
    specialties.find((v) => v.id === specialtyId)?.label || "";
  const subLabel =
    filteredDetailFields.find((v) => v.id === subId)?.label || "";
  const canNext = !!(specialtyId && subId);

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px]">
        <StepHeader onBack={() => history.back()} currentStep={1} />

        <main className="px-5 pb-28">
          <HostCard host={host} loading={hostLoading} />

          <section className="mt-8 space-y-7">
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
                  placeholder={
                    specialtyId ? "상세 분야" : "먼저 전문 분야를 선택해주세요."
                  }
                  disabled={!specialtyId}
                  onClick={() => setOpenSub(true)}
                />
              </div>
            </div>

            <TagInputSkeleton
              onAdd={() => {
                // 현재 선택된 전문/상세 분야를 Context에 저장
                update({
                  professionalField: specialtyId,
                  detailField: subId,
                });
                navigate("/experience/create/certificate");
              }}
            />
          </section>
        </main>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-5 pb-6 pt-3">
          <button
            type="button"
            disabled={!canNext}
            onClick={() => {
              if (!canNext) return;
              update({
                professionalField: specialtyId,
                detailField: subId,
              });
              navigate("/experience/create/step2");
            }}
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

      {/* 전문 분야 시트 */}
      <FieldSheet
        open={openSpecialty}
        title="전문 분야를 선택해주세요."
        options={specialties}
        selectedId={specialtyId}
        onSelect={setSpecialtyId}
        onNext={(newId) => {
          setSpecialtyId(newId);
          setOpenSpecialty(false);
        }}
        onClose={() => setOpenSpecialty(false)}
      />

      {/* 상세 분야 시트 */}
      <FieldSheet
        open={openSub}
        title="상세 분야를 선택해주세요."
        options={filteredDetailFields}
        selectedId={subId}
        onSelect={setSubId}
        onNext={(newId) => {
          setSubId(newId);
          setOpenSub(false);
        }}
        onClose={() => setOpenSub(false)}
      />
    </div>
  );
}
