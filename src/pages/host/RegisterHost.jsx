// src/pages/host/RegisterHost.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomTab from "../../components/BottomTab";
import doorImg from "../../assets/door.png";
import { getMyInfo } from "../../apis/user";
import { logout, deleteAccount } from "../../apis/auth";
import { getMyPageInfo } from "../../apis/mypage";
import { uploadProfileImage } from "../../apis/image";
import { checkNickname } from "../../apis/auth";
import { getMyReservations } from "../../apis/reservation";
import { fetchMyHostProfile } from "../../apis/host";
// ✅ 추가: 호스트 체험 목록 API 함수를 가져옵니다.
// import { fetchMyExperienceList } from "../../apis/host";

import { MdKeyboardArrowRight } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import { IoMdCamera } from "react-icons/io";
import { LuFolder } from "react-icons/lu";
import { FiPlusCircle } from "react-icons/fi";

// =================================================================
// 🚨 [가정] API 함수 정의: 실제로는 src/apis/host.js에 추가되어야 합니다.
// =================================================================
import api from "../../apis/api"; // api 인스턴스를 가져온다고 가정

export async function fetchMyExperienceList(signal) {
  try {
    // GET /api/v1/host/experiences/my-list 호출
    const res = await api.get("/host/experiences/my-list", { signal });

    // 응답 데이터가 배열이라고 가정
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error) {
    console.error("[fetchMyExperienceList] error:", error);

    // 403 권한 없음 또는 기타 오류 처리
    const message =
      error.response?.data?.message || "프로그램 목록을 불러오지 못했습니다.";

    return {
      success: false,
      message,
      data: [],
    };
  }
}
// =================================================================

// ✅ 최근 본 호스트 데이터를 저장할 localStorage 키 정의
const RECENT_HOSTS_KEY = "recentViewedHosts";
const MAX_RECENT_HOSTS = 5;

// Mock 데이터 (실제 호스트 ID와 이름, 이미지 URL 필요)
const MOCK_HOSTS_DATA = [
  { id: 1, name: "유다빈", profileImageUrl: "/host-avatar-1.png" },
  { id: 2, name: "김소현", profileImageUrl: "/host-avatar-2.png" },
  { id: 3, name: "최정민", profileImageUrl: "/host-avatar-3.png" },
  { id: 4, name: "민서린", profileImageUrl: "/host-avatar-4.png" },
  { id: 5, name: "박서현", profileImageUrl: "/host-avatar-5.png" },
];

/**
 * [가정] 사용자가 호스트 상세 페이지(`/host/:hostId`)를 방문했을 때
 * 이 함수를 호출하여 localStorage에 해당 호스트 정보를 저장한다고 가정합니다.
 * (실제 호스트 상세 페이지 컴포넌트에서 호출되어야 합니다.)
 * * @param {number} hostId - 호스트 ID
 */
export const addRecentHost = (hostId) => {
  // Mock 데이터를 사용하여 호스트 정보 조회 (실제는 API 호출 필요)
  const host = MOCK_HOSTS_DATA.find((h) => h.id === hostId);
  if (!host) return;

  try {
    const stored = localStorage.getItem(RECENT_HOSTS_KEY);
    let recentHosts = stored ? JSON.parse(stored) : [];

    // 1. 기존 목록에서 현재 호스트 ID를 가진 항목 제거 (최신화 목적)
    recentHosts = recentHosts.filter((h) => h.id !== hostId);

    // 2. 새 호스트 정보를 목록 맨 앞에 추가
    recentHosts.unshift(host);

    // 3. 최대 개수(5개)로 자르기
    recentHosts = recentHosts.slice(0, MAX_RECENT_HOSTS);

    // 4. localStorage에 저장
    localStorage.setItem(RECENT_HOSTS_KEY, JSON.stringify(recentHosts));
  } catch (e) {
    console.error("Error saving recent host to localStorage:", e);
  }
};

function ProfileEditModal({ name, nickname, onClose }) {
  // ✅ 기존 닉네임 상태/검증 유지
  const [nick, setNick] = useState(nickname || "");
  const maxLen = 8;
  const isNicknameChanged = nick !== nickname;
  const isValid = nick.length > 0 && nick.length <= maxLen;

  // ✅ 중복확인 & 업로드용 상태 (이전과 동일)
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(
    nick === nickname ? "ok" : null
  );
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    const value = nick.trim();
    if (!value) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    if (value.length > maxLen) {
      alert(`닉네임은 ${maxLen}자 이내로 입력해주세요.`);
      return;
    }

    if (value === nickname) {
      setCheckResult("ok");
      alert("기존 닉네임과 동일합니다.");
      return;
    }

    try {
      setChecking(true);
      setCheckResult(null);

      const res = await checkNickname(value);
      if (!res.success) {
        alert(res.message || "닉네임 중복 확인 중 오류가 발생했어요.");
        setCheckResult(null);
        return;
      }

      if (res.available) {
        setCheckResult("ok");
        alert("사용 가능한 닉네임이에요.");
      } else {
        setCheckResult("dup");
        alert("이미 사용 중인 닉네임이에요.");
      }
    } catch (e) {
      console.error(e);
      alert("닉네임 중복 확인 중 오류가 발생했어요.");
      setCheckResult(null);
    } finally {
      setChecking(false);
    }
  };

  // 프로필 이미지 업로드
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const res = await uploadProfileImage(file);
      if (!res.success) {
        alert(res.message || "프로필 이미지 업로드 중 오류가 발생했어요.");
        return;
      }

      if (res.url) {
        setPreviewUrl(res.url);
      }
    } catch (error) {
      console.error(error);
      alert("프로필 이미지 업로드 중 오류가 발생했어요.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleComplete = () => {
    // 닉네임 변경/이미지 업로드 처리 후 닫기
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/10">
      <div className="w-full max-w-[480px] bg-white relative flex flex-col">
        {/* 상단 로고 + 닫기 버튼 */}
        <header className="px-5 pt-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/inframe-logo.png"
              alt="in경산 로고"
              className="h-7 object-contain"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[26px] text-neutral-500"
          >
            ×
          </button>
        </header>

        {/* 내용 */}
        <div className="flex-1 px-5 pb-[120px] overflow-y-auto">
          {/* 타이틀 */}
          <h1 className="text-[24px] text-[#3A3A3A] font-bold mb-8">
            프로필 설정
          </h1>

          {/* 프로필 이미지 + 이름 */}
          <div className="flex items-center gap-5 mb-10">
            {/* 아바타 영역 */}
            <label className="relative w-16 h-16 rounded-full bg-[#F2F2F4] flex items-center justify-center cursor-pointer">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[30px] text-[#D4D4D8]">
                  <FaUser />
                </span>
              )}

              {/* 카메라 아이콘 동그라미 */}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center border border-[#E4E4E7]">
                <span className="text-[12px] text-neutral-500">
                  {uploading ? "…" : <IoMdCamera />}
                </span>
              </div>

              {/* 실제 파일 입력 */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* 이름 텍스트 */}
            <p className="text-[20px] font-bold text-[#4E4E51]">{name}</p>
          </div>

          {/* 닉네임 영역 */}
          <div className="mb-3">
            <label className="block text-[18px] font-bold text-[#3A3A3A] mb-1.5">
              닉네임
            </label>
            <p className="text-[12px] text-[#B6B6B6] mb-4">
              8자 이내로 적어주세요
            </p>

            {/* 입력 + 중복확인 버튼, 아래 얇은 라인 */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7]">
              <input
                type="text"
                value={nick}
                maxLength={maxLen}
                onChange={(e) => {
                  setNick(e.target.value);
                  setCheckResult(null);
                }}
                placeholder="닉네임을 입력해주세요"
                className="flex-1 text-[15px] outline-none placeholder:text-[#D4D4D8]"
              />

              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={
                  checking ||
                  !nick.trim() ||
                  (nick.trim() === nickname && checkResult === "ok")
                }
                className={`ml-3 px-4 py-1.5 rounded-full text-[13px] transition
                ${
                  checking
                    ? "bg-[#EFEFF1] text-[#B0B0B8] cursor-not-allowed" // 확인중
                    : checkResult === "ok"
                    ? "bg-[#E0F2FF] text-[#2D7DF6]" // 사용가능
                    : checkResult === "dup"
                    ? "bg-[#FFE4E4] text-[#E54848]" // 사용불가
                    : // 입력값이 있고, 아직 중복 확인을 하지 않았거나, 기존 닉네임과 다를 경우 -> 요청하신 #3A3A3A 색상 적용
                    nick.trim() && nick.trim() !== nickname
                    ? "bg-[#3A3A3A] text-white"
                    : "bg-[#EFEFF1] text-[#B0B0B8]" // 기본/비활성화
                }`}
              >
                {checking
                  ? "확인중"
                  : checkResult === "ok" && nick.trim() === nickname
                  ? "사용가능"
                  : checkResult === "ok"
                  ? "사용가능"
                  : checkResult === "dup"
                  ? "사용불가"
                  : "중복확인"}
              </button>
            </div>

            {/* 글자수 표시만 오른쪽 정렬 */}
            <div className="mt-2 text-right text-[11px] text-[#A1A1AA]">
              {nick.length} / {maxLen}
            </div>
          </div>
        </div>

        {/* 하단 완료 버튼 */}
        <div className="absolute left-0 w-full px-5 pb-6 bg-white bottom-[10px]">
          <button
            type="button"
            // ✅ 수정: disabled 속성 제거하여 항상 활성화
            onClick={handleComplete}
            // ✅ 수정: 항상 활성화된 버튼 색상 적용
            className="w-full h-[50px] rounded-[14px] text-[15px] font-semibold bg-[#3A3A3A] text-white"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
/* -----------------------------------------------------
    🔥 공통 메뉴
----------------------------------------------------- */
function CommonMenu({ showActivity = false }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = window.confirm("정말 로그아웃 하시겠어요?");
    if (!ok) return;

    const res = await logout();

    if (!res.success) {
      alert(res.message || "로그아웃 중 오류가 발생했습니다.");
      return;
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/signin", { replace: true });
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("정말 회원 탈퇴하시겠어요?");
    if (!ok) return;

    const res = await deleteAccount();

    if (!res.success) {
      alert(res.message || "회원 탈퇴 중 오류가 발생했습니다.");
      return;
    }

    localStorage.clear();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="mt-6 border-t border-neutral-100 pt-4 space-y-4 text-[16px] text-[#3A3A3A]">
      {showActivity && (
        <button
          className="w-full text-left"
          onClick={() => navigate("/my/reservations")}
        >
          내 활동 내역
        </button>
      )}
      <button
        className="w-full text-left"
        onClick={() => navigate("/host/termspage")}
      >
        약관 및 개인정보처리방침
      </button>

      <button className="w-full text-left" onClick={handleLogout}>
        로그아웃
      </button>

      <button className="w-full text-left" onClick={handleDeleteAccount}>
        회원 탈퇴하기
      </button>
    </div>
  );
}

/* -----------------------------------------------------
   🔥 참여자 View
----------------------------------------------------- */
function ParticipantView({ me }) {
  const navigate = useNavigate();
  const [myPage, setMyPage] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  // ✅ 추가: 최근 본 호스트 상태
  const [recentHosts, setRecentHosts] = useState([]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // 마이페이지 정보
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { success, data } = await getMyPageInfo();
      if (!mounted) return;

      if (success) setMyPage(data);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 예약 내역 (참여자 뷰의 지난 추억들 로딩용)
  useEffect(() => {
    let mounted = true;

    (async () => {
      // NOTE: getMyReservations는 목록을 반환하는 API라고 가정하고 사용
      const { success, data } = await getMyReservations();
      if (!mounted) return;

      setReservations(success ? data : []);
      setLoadingReservations(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ 추가: 최근 본 호스트 불러오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_HOSTS_KEY);
      // JSON.parse를 시도하고 실패하면 빈 배열로 설정
      const list = stored ? JSON.parse(stored) : [];
      setRecentHosts(
        Array.isArray(list) ? list.slice(0, MAX_RECENT_HOSTS) : []
      );
    } catch (e) {
      console.error("Failed to load recent hosts:", e);
      setRecentHosts([]);
    }
  }, []);

  const name = myPage?.name || me?.name || "이름";
  const nickname = myPage?.nickname || me?.nickname || "닉네임";
  const profileImageUrl =
    myPage?.profileImageUrl || me?.profileImageUrl || null;

  const reservationCount = myPage?.reservationCount ?? 0;
  const savedCount =
    (myPage?.hostLikeCount ?? 0) + (myPage?.experienceLikeCount ?? 0);
  const reviewCount = myPage?.reviewCount ?? 0;

  const stats = [
    { label: "예약내역", value: reservationCount, active: true },
    { label: "저장", value: savedCount },
    { label: "후기", value: reviewCount },
  ];

  const formatRelativeText = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "오늘 만났어요";
    if (diffDays === 1) return "1일 전에 만났어요";
    return `${diffDays}일 전에 만났어요`;
  };

  // [임시] 호스트 상세 페이지 이동 함수
  const goToHostDetail = (hostId) => {
    // 실제 라우팅 로직
    navigate(`/host/${hostId}`);
    // [참고] 실제 호스트 상세 페이지에서는 addRecentHost(hostId) 함수를 호출해야 합니다.
  };

  return (
    <main className="flex-1 px-5 pt-4 pb-28 overflow-y-auto">
      {/* 상단 프로필 */}
      <section className="mb-6 mt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowProfileEdit(true)}
            className="text-left"
          >
            <div className="flex items-center gap-1">
              <h1 className="text-[25px] font-bold">{name}</h1>
              <span className="text-[32px] text-neutral-400">
                <MdKeyboardArrowRight />
              </span>
            </div>

            <p className="text-[15px] text-neutral-400 mt-1">{nickname}</p>
          </button>

          <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>

        {/* 통계 */}
        <div className="mt-4 flex justify-between text-center text-[13px]">
          {stats.map((item, idx) => (
            <div key={item.label} className="relative flex-1">
              <div className="mt-1 text-neutral-500">{item.label}</div>
              <div
                className={`text-[16px] font-semibold ${
                  idx === 0 ? "text-[#e64a45]" : "text-[#3A3A3A]"
                }`}
              >
                {item.value}
              </div>

              {idx < stats.length - 1 && (
                <div className="absolute top-1/2 right-0 h-8 w-px -translate-y-1/2 bg-neutral-200"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ✅ 수정: 최근 본 호스트 (localStorage 기반) */}
      <section className="mb-6">
        <h2 className="text-[17px] font-bold mb-3">최근 내가 본 호스트</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {recentHosts.length > 0 ? (
            recentHosts.map((host) => (
              <button
                key={host.id}
                className="flex flex-col items-center"
                onClick={() => goToHostDetail(host.id)}
              >
                <div className="w-14 h-14 rounded-full bg-neutral-200 overflow-hidden mb-1">
                  {host.profileImageUrl ? (
                    <img
                      src={host.profileImageUrl}
                      alt={`${host.name} 호스트`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-full h-full p-3 text-neutral-400" />
                  )}
                </div>
                <p className="text-[12px] text-neutral-700">{host.name}</p>
              </button>
            ))
          ) : (
            <p className="text-[12px] text-neutral-400">
              최근 본 호스트가 없습니다.
            </p>
          )}
        </div>
      </section>

      {/* 지난 추억들 */}
      <section>
        <h2 className="text-[17px] font-bold mb-3">
          지난 추억들을 기억해보세요!
        </h2>

        {loadingReservations ? (
          <p className="text-[12px] text-neutral-400">
            예약 내역을 불러오는 중...
          </p>
        ) : reservations.length === 0 ? (
          <p className="text-[12px] text-neutral-400">
            아직 지난 예약 내역이 없어요.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {reservations.map((r) => {
              const hostName = r.hostName || r.host?.name || "호스트";
              const hostImageUrl =
                r.hostProfileImageUrl || r.host?.profileImageUrl || "";

              const thumbnailUrl =
                r.experienceThumbnailUrl || r.experience?.thumbnailUrl || "";

              return (
                <div
                  key={r.reservationId}
                  className="min-w-[260px] max-w-[260px] rounded-2xl border border-neutral-200 bg-white overflow-hidden flex-shrink-0"
                >
                  <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden">
                      {hostImageUrl && (
                        <img
                          src={hostImageUrl}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold">
                        {hostName} 호스트
                      </p>
                      <p className="text-[12px] text-neutral-500">
                        {formatRelativeText(r.reservedStartTime)}
                      </p>
                    </div>
                  </div>

                  <div className="h-[150px]">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <CommonMenu showActivity />

      {/* 🔥 프로필 설정 모달 표시 */}
      {showProfileEdit && (
        <ProfileEditModal
          name={name}
          nickname={nickname}
          onClose={() => setShowProfileEdit(false)}
        />
      )}
    </main>
  );
}

/* -----------------------------------------------------
   🔥 호스트 등록 화면
----------------------------------------------------- */
function HostRegisterView() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 px-6 mt-14 relative pb-28">
      <p className="text-[15px] text-[#7C7C7F] mb-2">
        당신의 이야기를 나눌 준비가 되셨나요?
      </p>
      <h1 className="text-[24px] font-bold leading-snug">
        지금 로컬 호스트로
        <br />
        함께하세요.
      </h1>

      <div className="absolute bottom-40 right-6 flex flex-col items-end">
        <img src={doorImg} className="w-[220px] mb-4 select-none" />
        <button
          onClick={() => navigate("/host/business-number")}
          className="bg-[#F13030] text-white py-2.5 px-6 rounded-full shadow-md text-[15px] font-semibold"
        >
          호스트 가입
        </button>
      </div>
    </main>
  );
}

// 오늘 날짜를 YYYY-MM-DD 형식의 문자열로 반환하는 헬퍼 함수
const getTodayDateString = () => {
  const today = new Date();
  // 한국 시간 기준으로 날짜를 설정하여 시간대 차이로 인한 날짜 오류 방지 (선택 사항)
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* -----------------------------------------------------
   🔥 호스트 대시보드 View
----------------------------------------------------- */
function HostDashboardView({
  me,
  hostMeData,
  allReservations,
  hostExperiences,
}) {
  // ✅ hostExperiences prop 추가
  const navigate = useNavigate();
  const name = hostMeData?.hostName || me?.name || "호스트 이름";
  const intro = hostMeData?.description || me?.hostIntro || "호스트 소개 문구";
  const profileImageUrl =
    hostMeData?.profileImageUrl || me?.profileImageUrl || null;

  // 오늘 일정 데이터 필터링 (기존 로직 유지)
  const todayDateString = getTodayDateString();
  const todaySchedule = allReservations.find((r) => {
    const startDatePart = r.reservedStartTime
      ? r.reservedStartTime.substring(0, 10)
      : "";
    return startDatePart === todayDateString;
  });

  const formattedStartTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      // HH:mm 형식으로 포맷팅 (시간대 고려가 필요할 수 있으나, 일단 로컬 시간으로 표시)
      const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      };
      return (
        date
          .toLocaleTimeString("ko-KR", timeOptions)
          .replace(":", "시 ")
          .replace(":", "분")
          .replace(" ", "") + "분"
      );
    } catch {
      return "시간 정보 없음";
    }
  };

  // API 데이터로 통계 구성
  const stats = [
    {
      label: "확정 대기",
      value: hostMeData?.unconfirmedReservationCount ?? 0,
      key: "unconfirmed",
    },
    { label: "받은 관심", value: hostMeData?.hostLikeCount ?? 0, key: "like" },
    { label: "받은 리뷰", value: hostMeData?.reviewCount ?? 0, key: "review" },
    {
      label: "예약내역",
      value: hostMeData?.confirmedReservationCount ?? 0,
      key: "confirmed",
    },
  ];

  // ✅ 내 프로그램 목록: API 데이터 사용
  // Experience List API 응답 구조:
  // [ { experienceId: 0, title: "string", ... } ]
  const programs = hostExperiences || [];

  // HostProfileSettings.jsx로 전달할 정보 (기존 로직 유지)
  const hostInfoForSettings = {
    businessNumber: me?.businessNumber,
    category: me?.category,
    businessName: me?.businessName,
    businessPhoneNumber: me?.businessPhoneNumber,
    businessEmail: me?.businessEmail,
    kakaoAddress: me?.kakaoAddress,
    intro: me?.description,
    description: me?.detailedDescription,
    cancelPolicy: me?.cancellationPolicy,
    startTime: me?.contactStartTime,
    endTime: me?.contactEndTime,
    addressBase: me?.addressBase,
    addressDetail: me?.addressDetail,
    latitude: me?.latitude,
    longitude: me?.longitude,
  };

  const goProfileSettings = () => {
    navigate("/host/profile-settings", {
      state: hostInfoForSettings,
    });
  };

  const goProgramManage = (programId) => {
    // TODO: 실제 프로그램 관리 페이지 경로로 교체
    navigate(`/host/programs/${programId || ""}`);
  };

  return (
    <main className="flex-1 px-5 pt-4 pb-28 overflow-y-auto">
      {/* ===== 상단 프로필 영역 ===== */}
      <section className="mb-6 mt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goProfileSettings}
            className="text-left"
          >
            <div className="flex items-center gap-1">
              <h1 className="text-[26px] font-bold">{name}</h1>
              <span className="text-[30px] text-neutral-400">
                <MdKeyboardArrowRight />
              </span>
            </div>

            <p className="text-[14px] text-neutral-500 mt-1">{intro}</p>
          </button>

          <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
            {profileImageUrl && (
              <img
                src={profileImageUrl}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* 통계 4개 */}
        <div className="mt-5 flex justify-between text-center text-[13px]">
          {stats.map((item, idx) => (
            <div key={item.key} className="relative flex-1">
              <div className="text-neutral-500 mb-1">{item.label}</div>
              <div
                className={`text-[16px] font-semibold ${
                  idx === 0 ? "text-[#e64a45]" : "text-[#3A3A3A]"
                }`}
              >
                {item.value}
              </div>

              {idx < stats.length - 1 && (
                <div className="absolute top-1/2 right-0 h-8 w-px -translate-y-1/2 bg-neutral-200" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== 오늘 일정 (API 데이터 적용) ===== */}
      <section className="mb-6">
        <h2 className="text-[17px] text-[#3A3A3A] font-bold mb-3">오늘 일정</h2>

        {todaySchedule ? (
          <div className="rounded-2xl bg-white border border-neutral-200 px-5 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <p className="text-[15px] font-semibold text-[#3A3A3A] mb-1">
              {todaySchedule.experienceName || "예약된 프로그램"}
            </p>
            <p className="text-[13px] text-neutral-500">
              {`오늘 ${formattedStartTime(
                todaySchedule.reservedStartTime
              )} · 참석 예정 ${todaySchedule.reservationCount || "0"}명`}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-neutral-200 px-5 py-4 text-center">
            <p className="text-[13px] text-neutral-400">
              오늘 예정된 일정이 없습니다.
            </p>
          </div>
        )}
      </section>

      {/* ===== 내 프로그램 (API 데이터 적용) ===== */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold">내 프로그램</h2>

          <button
            type="button"
            onClick={() => navigate("/experience/create/step1")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[#3A3A3A] text-white text-[12px] font-medium"
          >
            <span className="text-[14px]">
              <FiPlusCircle />
            </span>
            <span>프로그램 등록</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
          {programs.length > 0 ? (
            programs.map((program, index) => (
              <div
                key={program.experienceId} // experienceId 사용
                className={`flex items-center justify-between px-5 py-4 ${
                  index < programs.length - 1
                    ? "border-b border-neutral-100"
                    : ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  {/* title 필드 사용 */}
                  <p className="text-[15px] font-medium text-[#1D1D1D]">
                    {program.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => goProgramManage(program.experienceId)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 text-[13px] text-[#3F3F46] bg-white"
                >
                  <LuFolder className="text-[16px]" />
                  <span>관리</span>
                </button>
              </div>
            ))
          ) : (
            <div className="px-5 py-4 text-center">
              <p className="text-[13px] text-neutral-400">
                등록된 프로그램이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 공통 메뉴 (약관 / 로그아웃 / 탈퇴) */}
      <CommonMenu />
    </main>
  );
}

/* -----------------------------------------------------
   🔥 메인 컴포넌트
----------------------------------------------------- */
export default function RegisterHost() {
  const [tab, setTab] = useState(null);
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [hostMeData, setHostMeData] = useState(null);
  const [allReservations, setAllReservations] = useState([]);
  // ✅ 호스트 체험 목록 상태 추가
  const [hostExperiences, setHostExperiences] = useState([]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    (async () => {
      // 1. 일반 사용자 정보 (getMyInfo)
      const res = await getMyInfo();

      const outerData = res?.data ?? res?.data?.data ?? res;
      const userFromWrapper = res?.success && res.data ? res.data : outerData;
      const user =
        userFromWrapper?.user && typeof userFromWrapper.user === "object"
          ? userFromWrapper.user
          : userFromWrapper;

      if (!mounted) return;

      if (user) setMe(user);

      let rawRole =
        user?.role ??
        user?.roles ??
        user?.authority ??
        (Array.isArray(user?.authorities)
          ? user.authorities.map((a) => a.authority || a).join(",")
          : "");

      rawRole = (rawRole ?? "").toString().toUpperCase();

      const hostFlag = rawRole.includes("BUSINESS") || rawRole.includes("HOST");

      // 3. 전체 예약 내역 조회
      try {
        const resReservation = await getMyReservations();
        if (mounted && resReservation.success) {
          setAllReservations(resReservation.data);
        }
      } catch (error) {
        console.error("getMyReservations failed:", error);
      }

      // 2. 호스트 대시보드 데이터 및 체험 목록 조회 - 호스트일 경우에만 호출
      if (hostFlag) {
        try {
          // 호스트 프로필 조회
          const hostRes = await fetchMyHostProfile(controller.signal);
          if (mounted && hostRes) {
            setHostMeData(hostRes);
          }

          // ✅ 호스트 체험 목록 조회
          const experienceRes = await fetchMyExperienceList(controller.signal);
          if (mounted && experienceRes.success) {
            setHostExperiences(experienceRes.data); // ✅ 체험 목록 저장
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Host API Error:", error);
          }
        }
      }

      setIsHost(hostFlag);
      setTab(hostFlag ? "host" : "participant");

      setLoadingMe(false);
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] bg-white relative flex flex-col">
        {/* 상단 탭 */}
        <header className="relative pt-5 px-4 flex items-center justify-center">
          <div className="flex items-center bg-neutral-100 rounded-full p-1">
            <button
              onClick={() => setTab("participant")}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium ${
                tab === "participant"
                  ? "bg-white text-[#191F28] shadow-sm"
                  : "bg-transparent text-[#a3a3a3]"
              }`}
            >
              참여자
            </button>

            <button
              onClick={() => setTab("host")}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium ${
                tab === "host"
                  ? "bg-white text-[#191F28] shadow-sm"
                  : "bg-transparent text-[#a3a3a3]"
              }`}
            >
              호스트
            </button>
          </div>
        </header>

        {/* 탭 본문 */}
        {loadingMe || tab === null ? (
          <div className="flex-1 flex items-center justify-center text-[14px] text-neutral-400">
            불러오는 중...
          </div>
        ) : tab === "participant" ? (
          <ParticipantView me={me} />
        ) : isHost ? (
          // ✅ HostDashboardView에 호스트 체험 목록 전달
          <HostDashboardView
            me={me}
            hostMeData={hostMeData}
            allReservations={allReservations}
            hostExperiences={hostExperiences}
          />
        ) : (
          <HostRegisterView />
        )}
        {/* 하단 탭바 */}
        <BottomTab active="me" />
      </div>
    </div>
  );
}
