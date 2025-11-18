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
import { FiSettings } from "react-icons/fi";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import { IoMdCamera } from "react-icons/io";

function ProfileEditModal({ name, nickname, onClose }) {
  // ✅ 기존 닉네임 상태/검증 유지
  const [nick, setNick] = useState("");
  const maxLen = 8;
  const isValid = nick.length > 0 && nick.length <= maxLen;

  // ✅ 중복확인 & 업로드용 상태 (이전과 동일)
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
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

    try {
      setChecking(true);
      setCheckResult(null);

      const res = await checkNickname(value); // 프로젝트 API 형식 그대로 사용
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
                disabled={checking || !nick.trim()}
                className={`ml-3 px-4 py-1.5 rounded-full text-[13px] transition
                ${
                  checking
                    ? "bg-[#EFEFF1] text-[#B0B0B8] cursor-not-allowed"
                    : checkResult === "ok"
                    ? "bg-[#E0F2FF] text-[#2D7DF6]"
                    : checkResult === "dup"
                    ? "bg-[#FFE4E4] text-[#E54848]"
                    : "bg-[#EFEFF1] text-[#B0B0B8]"
                }`}
              >
                {checking
                  ? "확인중"
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
            disabled={!isValid}
            className={`w-full h-[50px] rounded-[14px] text-[15px] font-semibold ${
              isValid ? "bg-[#3A3A3A] text-white" : "bg-[#E1E1E3] text-white"
            }`}
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
function CommonMenu() {
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
      <button className="w-full text-left">내 활동 내역</button>
      <button className="w-full text-left">FAQ</button>
      <button className="w-full text-left">약관 및 개인정보처리방침</button>

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
  const [myPage, setMyPage] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

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

  // 예약 내역
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { success, data } = await getMyReservations();
      if (!mounted) return;

      setReservations(success ? data : []);
      setLoadingReservations(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const name = myPage?.name || me?.name || "닉네임";
  const nickname = myPage?.nickname || me?.nickname || "바람감자512";
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

          <div className="w-14 h-14 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
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
                className={`text-[15px] font-semibold ${
                  idx === 0 ? "text-[#e64a45]" : "text-neutral-800"
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

      {/* 최근 본 호스트 */}
      <section className="mb-6">
        <h2 className="text-[17px] font-bold mb-3">최근 내가 본 호스트</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {["유다빈", "김소현", "최정민", "민서린"].map((name) => (
            <div key={name} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-neutral-200 mb-1" />
              <p className="text-[12px] text-neutral-700">{name}</p>
            </div>
          ))}
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

      <CommonMenu />

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

/* -----------------------------------------------------
   🔥 호스트 대시보드 View
----------------------------------------------------- */
function HostDashboardView({ me }) {
  const name = me?.name || "호스트 이름";
  const intro = me?.hostIntro || "흙을 담아 삶의 이야기를 빚어냅니다.";

  return (
    <main className="flex-1 px-5 pt-4 pb-28 overflow-y-auto">
      {/* 호스트 기본 정보 */}
      <section className="mb-6 mt-4">
        <h1 className="text-[24px] font-bold">{name}</h1>
        <p className="text-[13px] text-neutral-500 mt-1">{intro}</p>
      </section>

      {/* 간단한 대시보드 카드 (필요하면 여기 더 채워서 사용하면 됨) */}
      <section className="mb-6">
        <h2 className="text-[17px] font-bold mb-3">호스트 대시보드</h2>
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-[13px] text-neutral-600">
          <p>호스트 센터에서 내 경험을 관리하고,</p>
          <p>예약/후기/호스트 소개를 설정할 수 있어요.</p>
        </div>
      </section>

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
  const [isHost, setIsHost] = useState(false); // ✅ 호스트 여부 상태

  useEffect(() => {
    let mounted = true;

    (async () => {
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

      setIsHost(hostFlag); // ✅ 호스트 여부 저장
      setTab(hostFlag ? "host" : "participant"); // ✅ 탭은 그대로 "host"/"participant"

      setLoadingMe(false);
    })();

    return () => {
      mounted = false;
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
              className={`px-4 py-1 rounded-full text-[13px] font-medium ${
                tab === "participant"
                  ? "bg-white text-[#191F28] shadow-sm"
                  : "bg-transparent text-[#a3a3a3]"
              }`}
            >
              참여자
            </button>

            <button
              onClick={() => setTab("host")}
              className={`px-4 py-1 rounded-full text-[13px] font-medium ${
                tab === "host"
                  ? "bg-white text-[#191F28] shadow-sm"
                  : "bg-transparent text-[#a3a3a3]"
              }`}
            >
              호스트
            </button>
          </div>

          {tab && (tab === "participant" || (tab === "host" && isHost)) && (
            <button className="absolute right-4 w-9 h-9 flex items-center justify-center">
              <FiSettings className="text-[22px] text-neutral-700" />
            </button>
          )}
        </header>

        {/* 탭 본문 */}
        {loadingMe || tab === null ? (
          <div className="flex-1 flex items-center justify-center text-[14px] text-neutral-400">
            불러오는 중...
          </div>
        ) : tab === "participant" ? (
          <ParticipantView me={me} />
        ) : isHost ? (
          <HostDashboardView me={me} />
        ) : (
          <HostRegisterView />
        )}
        {/* 하단 탭바 */}
        <BottomTab active="me" />
      </div>
    </div>
  );
}
