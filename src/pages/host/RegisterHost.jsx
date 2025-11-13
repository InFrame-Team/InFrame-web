// src/pages/host/RegisterHost.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BottomTab from "../../components/BottomTab";
import doorImg from "../../assets/door.png";
import { getMyInfo } from "../../apis/user";
import { logout, deleteAccount } from "../../apis/auth";
import { FiSettings } from "react-icons/fi";

// ===============================
// 공통 메뉴 (로그아웃 / 회원탈퇴 포함)
// ===============================
function CommonMenu() {
  const navigate = useNavigate();

  // 🔹 로그아웃
  const handleLogout = async () => {
    const ok = window.confirm("정말 로그아웃 하시겠어요?");
    if (!ok) return;

    const res = await logout();

    if (!res.success) {
      alert(res.message || "로그아웃 중 오류가 발생했습니다.");
      return;
    }

    // 토큰/유저 정보 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    alert("로그아웃 되었습니다.");

    // ✅ 로그인 화면으로 이동 (이메일 로그인 페이지로)
    navigate("/signin/email", { replace: true });
  };

  // 🔹 회원 탈퇴
  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      "정말 회원 탈퇴하시겠어요?\n이 작업은 되돌릴 수 없습니다."
    );
    if (!ok) return;

    const res = await deleteAccount();

    if (!res.success) {
      alert(res.message || "회원 탈퇴 중 오류가 발생했습니다.");
      return;
    }

    alert("회원 탈퇴가 완료되었습니다.");

    // 모든 로컬 데이터 제거
    localStorage.clear();

    // ✅ 로그인 화면으로 이동
    navigate("/signin/email", { replace: true });
  };

  return (
    <div className="mt-6 border-t border-neutral-100 pt-4 space-y-4 text-[14px] text-[#333]">
      <button className="w-full text-left">내 활동 내역</button>
      <button className="w-full text-left">FAQ</button>
      <button className="w-full text-left">약관 및 개인정보처리방침</button>

      <button className="w-full text-left" type="button" onClick={handleLogout}>
        로그아웃
      </button>

      <button
        className="w-full text-left text-[#e64a45]"
        type="button"
        onClick={handleDeleteAccount}
      >
        회원 탈퇴하기
      </button>
    </div>
  );
}

// ===============================
// 참여자 탭 화면
// ===============================
function ParticipantView({ me }) {
  const name = me?.name || "닉네임";
  const nickname = me?.nickname || "바람감자512";

  return (
    <main className="flex-1 px-5 pt-4 pb-28 overflow-y-auto">
      {/* 상단 프로필 */}
      <section className="mb-6">
        <h1 className="text-[24px] font-bold">{name}</h1>
        <p className="text-[13px] text-neutral-500 mt-1">{nickname}</p>

        {/* 통계 */}
        <div className="mt-4 flex justify-between text-center text-[13px]">
          {[
            { label: "예약내역", value: 14, active: true },
            { label: "저장", value: 15 },
            { label: "후기", value: 12 },
            { label: "호스트", value: 5 },
          ].map((item) => (
            <div key={item.label} className="flex-1">
              <div
                className={`text-[15px] font-semibold ${
                  item.active ? "text-[#e64a45]" : "text-neutral-800"
                }`}
              >
                {item.value}
              </div>
              <div className="mt-1 text-neutral-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 내 취향 */}
      <section className="mb-6">
        <h2 className="text-[15px] font-semibold mb-2">내 취향</h2>
        <div className="rounded-2xl bg-[#f7f7f7] px-4 py-3">
          <p className="text-[14px] font-semibold mb-1">
            차분하고 힐링되는 경험을 좋아해요
          </p>
          <p className="text-[12px] text-neutral-500">
            바람감자님의 즐겨찾기 기반으로 분석해봤어요
          </p>
        </div>
      </section>

      {/* 최근 내가 본 호스트 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold">최근 내가 본 호스트</h2>
          <button className="text-[12px] text-neutral-400">›</button>
        </div>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold">
            지난 추억들을 기억해보세요!
          </h2>
          <button className="text-[12px] text-neutral-400">›</button>
        </div>

        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200 overflow-hidden"
            >
              <div className="h-28 bg-neutral-200" />
              <div className="px-4 py-3">
                <p className="text-[13px] font-semibold">오민서 호스트</p>
                <p className="text-[12px] text-neutral-500">
                  {i === 1 ? "4일 전에 만났어요" : "26일 전에 만났어요"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CommonMenu />
    </main>
  );
}

// ===============================
// 호스트 탭 – 아직 호스트 아님 (가입 유도 화면)
// ===============================
function HostRegisterView() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 px-6 mt-14 relative pb-28">
      {/* 상단 문구 */}
      <p className="text-[15px] text-[#7C7C7F] mb-2">
        당신의 이야기를 나눌 준비가 되셨나요?
      </p>
      <h1 className="text-[24px] font-bold leading-snug">
        지금 로컬 호스트로
        <br />
        함께하세요.
      </h1>

      {/* 이미지 + 버튼 (오른쪽 하단 고정) */}
      <div className="absolute bottom-40 right-6 flex flex-col items-end">
        <img
          src={doorImg}
          alt="호스트 가입 이미지"
          className="w-[220px] mb-4 select-none pointer-events-none"
        />
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

// ===============================
// 호스트 탭 – 이미 호스트 (대시보드)
// ===============================
function HostDashboardView({ me }) {
  const name = me?.name || "호스트 이름";
  const intro = me?.hostIntro || "흙을 담아 삶의 이야기를 빚어냅니다.";

  return (
    <main className="flex-1 px-5 pt-4 pb-28 overflow-y-auto">
      {/* 상단 프로필 */}
      <section className="mb-6">
        <h1 className="text-[24px] font-bold">{name}</h1>
        <p className="text-[13px] text-neutral-500 mt-1">{intro}</p>

        {/* 통계 */}
        <div className="mt-4 flex justify-between text-center text-[13px]">
          {[
            { label: "확정 대기", value: 14, active: true },
            { label: "받은 관심", value: 15 },
            { label: "받은 후기", value: 12 },
            { label: "예약내역", value: 5 },
          ].map((item) => (
            <div key={item.label} className="flex-1">
              <div
                className={`text-[15px] font-semibold ${
                  item.active ? "text-[#e64a45]" : "text-neutral-800"
                }`}
              >
                {item.value}
              </div>
              <div className="mt-1 text-neutral-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 오늘 일정 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-semibold">오늘 일정</h2>
          <button className="text-[12px] text-neutral-400">전체보기</button>
        </div>

        <div className="rounded-2xl border border-neutral-200 px-4 py-3 bg-white">
          <p className="text-[14px] font-semibold mb-1">
            도자기 집중 심화 워크숍
          </p>
          <p className="text-[12px] text-neutral-500">
            오늘 14:00-16:00 · 참석 예정 6명
          </p>
        </div>
      </section>

      {/* 내 프로그램 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-semibold">내 프로그램</h2>
          <button className="text-[12px] px-3 py-1 rounded-full border border-neutral-300">
            + 프로그램 등록
          </button>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100">
          {[
            { title: "초벌부터 유약까지, 도자기의 여정", status: "공개" },
            {
              title: "손끝으로 만드는 머그컵 원데이 클래스",
              status: "공개",
            },
            {
              title: "도자기 집중 심화 워크숍",
              status: "비공개",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="px-4 py-3 flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] text-neutral-500 border border-neutral-300 rounded-full px-2 py-0.5 mr-2">
                  {p.status}
                </span>
                <span className="text-[13px] text-neutral-800">{p.title}</span>
              </div>
              <button className="text-[12px] px-3 py-1 rounded-full border border-neutral-300">
                관리
              </button>
            </div>
          ))}
        </div>
      </section>

      <CommonMenu />
    </main>
  );
}

// ===============================
// 메인 컴포넌트
// ===============================
export default function RegisterHost() {
  const [tab, setTab] = useState(null); // 처음에는 null → 내 정보 받아온 뒤 결정
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getMyInfo();
        console.log("[RegisterHost] /user/me raw res:", res);

        // { success, data } 형태 / 아니면 바로 user 객체 등 여러 케이스 대응
        const outerData = res?.data ?? res?.data?.data ?? res;
        const userFromWrapper = res?.success && res.data ? res.data : outerData;

        const user =
          userFromWrapper?.user && typeof userFromWrapper.user === "object"
            ? userFromWrapper.user
            : userFromWrapper;

        if (!mounted) return;

        console.log("[RegisterHost] parsed user:", user);

        if (!user) {
          setTab("participant");
          setLoadingMe(false);
          return;
        }

        setMe(user);

        // role 여러 형태 대응
        let rawRole =
          user.role ??
          user.roles ??
          user.authority ??
          (Array.isArray(user.authorities)
            ? user.authorities.map((a) => a.authority || a).join(",")
            : "");

        rawRole = (rawRole ?? "").toString().toUpperCase();

        // "BUSINESS" 또는 "HOST" 포함하면 호스트로 간주
        const hostFlag =
          rawRole.includes("BUSINESS") || rawRole.includes("HOST");

        // 호스트면 host 탭, 아니면 participant 탭
        setTab(hostFlag ? "host" : "participant");
        setLoadingMe(false);
      } catch (e) {
        console.error("[RegisterHost] getMyInfo 실패:", e);
        if (mounted) {
          setTab("participant");
          setLoadingMe(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // isHost 계산도 동일 로직
  let roleStr = "";
  if (me) {
    roleStr =
      me.role ??
      me.roles ??
      me.authority ??
      (Array.isArray(me.authorities)
        ? me.authorities.map((a) => a.authority || a).join(",")
        : "");
  }
  const upperRole = (roleStr ?? "").toString().toUpperCase();
  const isHost = upperRole.includes("BUSINESS") || upperRole.includes("HOST");

  // 🧠 설정 버튼 노출 여부
  const showSettings =
    !loadingMe && tab !== null && !(tab === "host" && !isHost);

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* 상단 탭 & 설정 아이콘 */}
      <header className="relative pt-5 px-4 flex items-center justify-center">
        {/* 중앙 탭 */}
        <div className="flex items-center bg-neutral-100 rounded-full p-1">
          <button
            onClick={() => setTab("participant")}
            className={`px-5 py-2 rounded-full text-[15px] font-medium transition-all ${
              tab === "participant"
                ? "bg-[#3a3a3a] text-white shadow-sm"
                : "bg-transparent text-[#a3a3a3]"
            }`}
          >
            참여자
          </button>
          <button
            onClick={() => setTab("host")}
            className={`px-5 py-2 rounded-full text-[15px] font-medium transition-all ${
              tab === "host"
                ? "bg-[#3a3a3a] text-white shadow-sm"
                : "bg-transparent text-[#a3a3a3]"
            }`}
          >
            호스트
          </button>
        </div>

        {/* 오른쪽 설정 아이콘 (조건부 렌더링) */}
        {showSettings && (
          <button
            type="button"
            className="absolute right-4 w-9 h-9 rounded-full flex items-center justify-center bg-neutral-100"
          >
            <FiSettings className="text-[18px] text-neutral-700" />
          </button>
        )}
      </header>

      {/* 탭 내용 */}
      {loadingMe || tab === null ? (
        <div className="flex-1 flex items-center justify-center text-[14px] text-neutral-400">
          불러오는 중...
        </div>
      ) : tab === "participant" ? (
        <ParticipantView me={me} />
      ) : isHost ? (
        // ✅ 호스트 등록 완료 → 첫 번째(대시보드) 화면
        <HostDashboardView me={me} />
      ) : (
        // ✅ 호스트 아님 → 두 번째(호스트 가입) 화면
        <HostRegisterView />
      )}

      {/* 하단 탭바 */}
      <div className="fixed bottom-0 left-0 right-0">
        <BottomTab active="me" />
      </div>
    </div>
  );
}
