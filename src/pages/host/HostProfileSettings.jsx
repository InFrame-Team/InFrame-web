// src/pages/host/HostProfileSettings.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateHost } from "../../apis/host";
import { uploadProfileImage, uploadCompanyLogo } from "../../apis/image";
import { getMyInfo } from "../../apis/user";

import { FaUser } from "react-icons/fa6";
import { IoMdCamera } from "react-icons/io";
import { MdArrowForwardIos } from "react-icons/md";

// 24시간 시간 목록
const TIMES = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`
);

// 시간 선택 컴포넌트
function TimeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-neutral-300 rounded-md h-9 px-3 text-[12px] text-neutral-600 flex items-center justify-between bg-white"
      >
        <span>{value}</span>
        <span>⌄</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-44 bg-white border border-neutral-300 rounded-md shadow-sm overflow-y-auto">
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-[12px] ${
                t === value
                  ? "bg-neutral-100 font-semibold"
                  : "hover:bg-neutral-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 초기 상태를 설정하는 유틸리티 함수
// baseInfo는 navigate로 전달받은 데이터 (HostDashboardView 또는 LocationPicker에서 옴)
function getInitialState(baseInfo) {
  let draft = {};
  try {
    const saved = sessionStorage.getItem("hostProfileDraft");
    if (saved) {
      draft = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("[HostProfileSettings] draft 복원 실패:", e);
  }

  // baseInfo (navigate state) > sessionStorage draft > ""/기본값 순으로 우선순위를 가집니다.
  return {
    // 텍스트 입력 필드: draft/baseInfo가 있다면 사용
    // HostDashboardView에서 me의 필드가 이 baseInfo로 전달됩니다.
    intro: draft.intro ?? baseInfo.intro ?? "",
    description: draft.description ?? baseInfo.description ?? "",
    cancelPolicy: draft.cancelPolicy ?? baseInfo.cancelPolicy ?? "",
    startTime: draft.startTime ?? baseInfo.startTime ?? "09:00",
    endTime: draft.endTime ?? baseInfo.endTime ?? "18:00",

    // 주소: 주소 검색 후 돌아왔을 때는 baseInfo (location.state)의 최신 주소를 무조건 사용
    address: baseInfo.addressBase ?? draft.address ?? "",
    detail: baseInfo.addressDetail ?? draft.detail ?? "",

    // 위치 정보: baseInfo에서만 가져옴
    latitude: baseInfo.latitude ?? null,
    longitude: baseInfo.longitude ?? null,
  };
}

export default function HostProfileSettings() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const baseInfo = state || {}; // HostBasicInfo, LocationPicker, HostDashboardView에서 온 데이터

  // HostDashboardView에서 navigate로 전달한 정보를 initialState가 이미 사용하고 있습니다.
  const initialState = getInitialState(baseInfo);

  // --- 상태 초기화 (navigate state 또는 sessionStorage 우선) ---
  const [address, setAddress] = useState(initialState.address);
  const [detail, setDetail] = useState(initialState.detail);
  const [intro, setIntro] = useState(initialState.intro);
  const [description, setDescription] = useState(initialState.description);
  const [cancelPolicy, setCancelPolicy] = useState(initialState.cancelPolicy);

  const [startTime, setStartTime] = useState(initialState.startTime);
  const [endTime, setEndTime] = useState(initialState.endTime);

  const [latitude] = useState(initialState.latitude);
  const [longitude] = useState(initialState.longitude);
  // --------------------

  const [userName, setUserName] = useState("");

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const profileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    intro: false,
    address: false,
    detail: false,
    cancelPolicy: false,
    description: false,
  });

  const isFormValid = [intro, address, detail, cancelPolicy, description].every(
    (v) => v.trim() !== ""
  );

  // ✅ [수정/확인] sessionStorage에 드래프트 저장 (모든 텍스트 상태 변경 시 실행)
  useEffect(() => {
    const draft = {
      intro,
      description,
      cancelPolicy,
      address,
      detail,
      startTime,
      endTime,
    };
    try {
      sessionStorage.setItem("hostProfileDraft", JSON.stringify(draft));
    } catch (e) {
      console.warn("[HostProfileSettings] draft 저장 실패:", e);
    }
  }, [intro, description, cancelPolicy, address, detail, startTime, endTime]);

  // ✅ [수정] 사용자 정보 및 기존 호스트 정보 불러와서 상태에 반영 (state/draft가 없을 때 DB 정보 사용)
  useEffect(() => {
    (async () => {
      const { success, data, message } = await getMyInfo();
      if (!success || !data) {
        console.warn("[HostProfileSettings] getMyInfo 실패:", message);
        return;
      }

      setUserName(data.name || data.nickname || "");

      // 1. 이미지 URL 로드 (state/draft에 이미지 URL이 없으므로 DB 정보가 최우선)
      if (data.profileImageUrl) {
        setProfileImageUrl(data.profileImageUrl);
      }
      if (data.companyLogoUrl) {
        setCompanyLogoUrl(data.companyLogoUrl);
      }

      // 2. 입력 필드에 DB 정보 반영 (state/draft에도 값이 없을 경우에만 DB 정보로 채우기)
      // 이 로직은 필수입니다. baseInfo(navigate state)가 없는 초기 진입 시 DB 정보를 로드합니다.

      const apiDataMap = {
        intro: data.description, // 짧은 소개
        description: data.detailedDescription, // 긴 상세 소개
        cancelPolicy: data.cancellationPolicy,
        address: data.addressBase,
        detail: data.addressDetail,
        startTime: data.contactStartTime,
        endTime: data.contactEndTime,
      };

      // 현재 상태가 비어 있고, API 데이터에 값이 있다면 DB 값으로 채웁니다.
      setIntro((prev) => prev || apiDataMap.intro || "");
      setDescription((prev) => prev || apiDataMap.description || "");
      setCancelPolicy((prev) => prev || apiDataMap.cancelPolicy || "");
      setAddress((prev) => prev || apiDataMap.address || "");
      setDetail((prev) => prev || apiDataMap.detail || "");

      // 시간은 기본값이 있거나 state/draft에서 가져왔을 수 있으므로, API 데이터에 값이 있다면 덮어씁니다.
      setStartTime((prev) => apiDataMap.startTime || prev);
      setEndTime((prev) => apiDataMap.endTime || prev);
    })();
  }, []);

  // 주소 검색 페이지로 이동
  const goLocationPicker = () => {
    // 현재 입력된 모든 데이터를 state에 담아 다음 페이지로 넘깁니다.
    navigate("/host/location-picker", {
      state: {
        // 사업자 기본 정보 (HostDashboardView에서 왔다면 baseInfo에 이미 담겨있음)
        businessNumber: baseInfo.businessNumber,
        category: baseInfo.category,
        businessName: baseInfo.businessName,
        businessPhoneNumber: baseInfo.businessPhoneNumber,
        businessEmail: baseInfo.businessEmail,
        kakaoAddress: baseInfo.kakaoAddress,

        // 현재 화면에서 입력된 모든 데이터 (주소 검색 후 돌아왔을 때 복원용)
        addressBase: address,
        addressDetail: detail,
        latitude,
        longitude,
        intro,
        description,
        cancelPolicy,
        startTime,
        endTime,
      },
    });
  };

  const handleSelectProfileImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfile(true);

    const localUrl = URL.createObjectURL(file);
    setProfileImageUrl(localUrl);

    // ✅ 이미지 업로드 API 호출
    const { success, url, message } = await uploadProfileImage(file);
    setUploadingProfile(false);

    if (!success) {
      alert(message);
      return;
    }
    if (url) setProfileImageUrl(url);
  };

  const handleSelectCompanyLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    const localUrl = URL.createObjectURL(file);
    setCompanyLogoUrl(localUrl);

    // ✅ 이미지 업로드 API 호출
    const { success, url, message } = await uploadCompanyLogo(file);
    setUploadingLogo(false);

    if (!success) {
      alert(message);
      return;
    }
    if (url) setCompanyLogoUrl(url);
  };

  const handleComplete = async () => {
    if (submitting) return;

    // 유효성 검사
    const newErrors = {
      intro: intro.trim() === "",
      address: address.trim() === "",
      detail: detail.trim() === "",
      cancelPolicy: cancelPolicy.trim() === "",
      description: description.trim() === "",
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // 초기 사업자 정보 확인
    if (!baseInfo.businessNumber) {
      alert("사업자 기본 정보가 없습니다. 처음부터 다시 진행해주세요.");
      navigate("/host/business-number");
      return;
    }

    // /api/v1/host/update 에 맞춘 payload 구성
    const payload = {
      // 기본 정보 (HostBasicInfo/HostDashboardView에서 옴)
      businessNumber: baseInfo.businessNumber,
      category: baseInfo.category,
      businessName: baseInfo.businessName,
      businessPhoneNumber: baseInfo.businessPhoneNumber,
      businessEmail: baseInfo.businessEmail,
      kakaoAddress: baseInfo.kakaoAddress,

      // 소개 (현재 화면 입력)
      description: intro, // 짧은 한 줄 소개
      detailedDescription: description, // 긴 상세 소개

      // 위치 (현재 화면 입력 또는 LocationPicker에서 옴)
      addressBase: address,
      addressDetail: detail,
      latitude,
      longitude,

      // 연락 가능 시간 & 취소 정책 (현재 화면 입력)
      contactStartTime: startTime,
      contactEndTime: endTime,
      cancellationPolicy: cancelPolicy,

      // 이미지 URL (업로드 후 결과)
      profileImageUrl: profileImageUrl,
      companyLogoUrl: companyLogoUrl,
    };

    console.log("▶︎ /host/update payload:", payload);

    setSubmitting(true);
    const { success, message } = await updateHost(payload);
    setSubmitting(false);

    if (!success) {
      alert(message);
      return;
    }

    // ✅ 저장 완료되면 초안 삭제
    sessionStorage.removeItem("hostProfileDraft");

    navigate("/host/complete");
  };

  const buttonEnabled = isFormValid && !submitting;

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] relative pb-24">
        {/* 상단 헤더 */}
        <header className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <img
              src="/inframe-logo.png"
              alt="in경산 로고"
              className="h-8 object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[18px] text-[#3A3A3A]"
          >
            ✕
          </button>
        </header>

        {/* 본문 */}
        <main className="px-4 pt-3 pb-4 flex-1 overflow-y-auto">
          {/* 제목 */}
          <h1 className="text-[26px] text-[#3A3A3A] font-bold mt-5 mb-3">
            프로필 설정
          </h1>

          {/* 프로필 + 한줄 소개 */}
          <section className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-full bg-[#F0F0F0] flex items-center justify-center overflow-visible"
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="프로필"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-[#D4D4D8]">
                    <FaUser />
                  </span>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-200">
                  <span className="text-[11px] text-neutral-500">
                    <IoMdCamera />
                  </span>
                </div>
              </button>

              <div className="flex flex-col">
                {userName && (
                  <p className="text-[22px] font-bold text-[#3A3A3A]">
                    {userName}
                  </p>
                )}
                {uploadingProfile && (
                  <span className="mt-1 text-[11px] text-neutral-500">
                    프로필 이미지 업로드 중...
                  </span>
                )}
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              className="hidden"
              onChange={handleSelectProfileImage}
              // ✅ 중요: 파일 선택 후 같은 파일 재선택 시에도 onChange가 발생하도록 value를 초기화합니다.
              onClick={(e) => (e.target.value = null)}
            />

            <p className="text-[12px] text-[#B6B6B6] mb-2">
              25자 이내로 적어주세요
            </p>

            <div className="relative">
              <textarea
                rows={1}
                maxLength={25}
                value={intro}
                onChange={(e) => {
                  setIntro(e.target.value);
                  setErrors((prev) => ({ ...prev, intro: false }));
                }}
                placeholder="예. 흙을 담아 삶의 이야기를 빚어냅니다."
                className={`w-full border-b bg-transparent text-[15px] text-black outline-none placeholder:text-[#B6B6B6] focus:border-neutral-400 transition-colors resize-none pb-1 ${
                  errors.intro ? "border-[#e64a45]" : "border-neutral-200"
                }`}
              />
              <div className="absolute right-0 bottom-[-18px] text-[11px] text-neutral-400">
                {intro.length} / 25
              </div>
            </div>
          </section>

          {/* 위치 */}
          <section className="mb-8">
            <p className="text-[20px] font-bold mb-2">위치</p>

            <button
              type="button"
              onClick={goLocationPicker}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-md border bg-white text-[13px] text-neutral-600 ${
                errors.address ? "border-[#e64a45]" : "border-neutral-300"
              }`}
            >
              <span>{address || "지번, 도로명, 건물명으로 검색"}</span>
              <span className="text-[16px] text-neutral-300">
                <MdArrowForwardIos />
              </span>
            </button>

            <input
              type="text"
              value={detail}
              onChange={(e) => {
                setDetail(e.target.value);
                setErrors((prev) => ({ ...prev, detail: false }));
              }}
              placeholder="상세주소를 입력해주세요"
              className={`mt-3 w-full px-3 py-3 rounded-md border bg-white text-[13px] text-black outline-none placeholder:text-[#B6B6B6] ${
                errors.detail ? "border-[#e64a45]" : "border-neutral-300"
              }`}
            />
          </section>

          {/* 연락 가능 시간 */}
          <section className="mb-8">
            <p className="text-[20px] font-bold mb-2">연락 가능 시간</p>

            <div className="flex items-center gap-2">
              <TimeSelect value={startTime} onChange={setStartTime} />
              <span className="text-neutral-400 text-[13px]">-</span>
              <TimeSelect value={endTime} onChange={setEndTime} />
            </div>
          </section>

          {/* 취소 정책 */}
          <section className="mb-8">
            <p className="text-[20px] font-bold mb-2">
              취소 정책을 작성해주세요.
            </p>
            <div
              className={`rounded-md px-3 py-2 border ${
                errors.cancelPolicy ? "border-[#e64a45]" : "border-neutral-200"
              }`}
            >
              <textarea
                rows={4}
                value={cancelPolicy}
                onChange={(e) => {
                  setCancelPolicy(e.target.value);
                  setErrors((prev) => ({ ...prev, cancelPolicy: false }));
                }}
                placeholder="추가해 주세요."
                className="w-full bg-white text-[13px] outline-none resize-none placeholder:text-[#B6B6B6]"
              />
            </div>
          </section>

          {/* 업체 관련 사진 */}
          <section className="mb-8">
            <p className="text-[20px] font-bold mb-1">업체 관련 사진</p>
            <p className="text-[15px] font-medium text-[#969696] mb-3">
              업체의 로고나 사진을 등록해주세요.
            </p>

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="w-20 h-20 border border-neutral-300 rounded-md flex flex-col items-center justify-center text-neutral-400 text-[11px] gap-1 overflow-hidden bg-white"
            >
              {companyLogoUrl ? (
                <img
                  src={companyLogoUrl}
                  alt="업체 로고"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <span className="text-[30px]">
                    <IoMdCamera />
                  </span>
                  <span>0 / 1</span>
                </>
              )}
            </button>

            {uploadingLogo && (
              <p className="mt-1 text-[11px] text-neutral-500">
                로고 이미지 업로드 중...
              </p>
            )}

            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              className="hidden"
              onChange={handleSelectCompanyLogo}
              // ✅ 중요: 파일 선택 후 같은 파일 재선택 시에도 onChange가 발생하도록 value를 초기화합니다.
              onClick={(e) => (e.target.value = null)}
            />
          </section>

          {/* 상세 소개 */}
          <section className="mb-4">
            <p className="text-[20px] font-bold mb-2">
              호스트에 대해 자세히 이야기해주세요.
            </p>

            <div className="rounded-md p-3 bg-[#F4F4F4] mb-2">
              <p className="text-[13px] font-bold text-[#3A3A3A]">
                이런 내용을 적어보세요!
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#3A3A3A] leading-relaxed">
                무엇을 만드는 곳인지, 어떤 사람들과 함께하고 있는지, 이 일을
                시작하게 된 계기나 브랜드의 이야기를 들려주세요.
              </p>
            </div>

            <textarea
              rows={6}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: false }));
              }}
              className={`w-full border rounded-md text-[13px] p-2 outline-none resize-none ${
                errors.description ? "border-[#e64a45]" : "border-[#E6E6E6]"
              }`}
              placeholder="예) 이 특별한 초콜릿 만들기 체험에서는 ‘카카오 블룸’ 디저트 바의 오너 파티시에 박서현님과 함께합니다. ..."
            />
            <div className="mt-1 text-right text-[11px] text-neutral-400">
              {description.length} / 2000
            </div>
          </section>
        </main>

        {/* 하단 완료 버튼 */}
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3 bg-white border-t border-neutral-100">
          <button
            type="button"
            onClick={handleComplete}
            disabled={!buttonEnabled}
            className={`w-full h-11 rounded-xl text-[14px] font-semibold text-white ${
              buttonEnabled ? "bg-[#3A3A3A]" : "bg-neutral-300"
            }`}
          >
            {submitting ? "저장 중..." : "완료"}
          </button>
        </footer>
      </div>
    </div>
  );
}
