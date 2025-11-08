// src/pages/host/HostProfileSettings.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateHost } from "../../apis/host";

// 0~23시 1시간 단위
const TIMES = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`
);

function TimeSelect({ label, value, onChange }) {
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

export default function HostProfileSettings() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const baseInfo = state || {};

  // 위치 / 소개
  const [address, setAddress] = useState(baseInfo.addressBase || "");
  const [detail, setDetail] = useState(baseInfo.addressDetail || "");
  const [intro, setIntro] = useState("");
  const [description, setDescription] = useState("");
  const [cancelPolicy, setCancelPolicy] = useState("");

  // 연락 가능 시간 (프론트에서만 사용)
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // 위도/경도는 위치 선택 화면에서 채워짐
  const [latitude] = useState(baseInfo.latitude ?? null);
  const [longitude] = useState(baseInfo.longitude ?? null);

  const [submitting, setSubmitting] = useState(false);

  // 위치 선택 화면으로 이동
  const goLocationPicker = () => {
    navigate("/host/location-picker", {
      state: {
        ...baseInfo,
        addressBase: address,
        addressDetail: detail,
        latitude,
        longitude,
      },
    });
  };

  const handleComplete = async () => {
    if (submitting) return;

    if (!baseInfo.businessNumber) {
      alert("사업자 기본 정보가 없습니다. 처음부터 다시 진행해주세요.");
      navigate("/host/business-number");
      return;
    }

    const payload = {
      businessNumber: baseInfo.businessNumber,
      businessName: baseInfo.businessName,
      businessPhoneNumber: baseInfo.businessPhoneNumber,
      businessEmail: baseInfo.businessEmail,
      kakaoAddress: baseInfo.kakaoAddress,
      description,
      addressBase: address,
      addressDetail: detail,
      latitude,
      longitude,
    };

    console.log("▶︎ /host/update payload:", payload);

    setSubmitting(true);
    const { success, message } = await updateHost(payload);
    setSubmitting(false);

    if (!success) {
      alert(message);
      return;
    }

    navigate("/host/congrats");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 헤더 */}
      <header className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <img
            src="/inframe-logo.png"
            alt="in경산 로고"
            className="h-5 object-contain"
          />
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[18px] text-neutral-500"
        >
          ✕
        </button>
      </header>

      {/* 본문 */}
      <main className="px-4 pt-3 pb-4 flex-1 overflow-y-auto">
        {/* 제목 */}
        <h1 className="text-[17px] font-bold mb-5">프로필 설정</h1>

        {/* 프로필 + 25자 소개 */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
              <span className="text-2xl text-neutral-400">👤</span>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-200">
                <span className="text-[10px]">📷</span>
              </div>
            </div>
          </div>

          <p className="text-[13px] font-semibold mb-1">자신을 소개해주세요!</p>
          <p className="text-[11px] text-neutral-400 mb-2">
            25자 이내로 적어주세요
          </p>

          <div className="border border-neutral-200 rounded-md bg-neutral-50 px-3 py-2">
            <textarea
              rows={2}
              maxLength={25}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="예. 흙을 담아 삶의 이야기를 빚어냅니다."
              className="w-full bg-transparent text-[13px] outline-none resize-none placeholder:text-neutral-300"
            />
            <div className="mt-1 text-right text-[11px] text-neutral-400">
              {intro.length} / 25
            </div>
          </div>
        </section>

        {/* 위치 */}
        <section className="mb-8">
          <p className="text-[13px] font-semibold mb-2">위치</p>

          <button
            type="button"
            onClick={goLocationPicker}
            className="w-full flex items-center justify-between px-3 py-3 rounded-md border border-neutral-300 bg-white text-[13px] text-neutral-600"
          >
            <span>{address || "지번, 도로명, 건물명으로 검색"}</span>
            <span className="text-[16px] text-neutral-300">›</span>
          </button>

          <input
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="상세주소를 입력해주세요"
            className="mt-3 w-full border border-neutral-300 rounded-md px-3 py-3 text-[13px] outline-none placeholder:text-neutral-300"
          />
        </section>

        {/* 연락 가능 시간 (1시간 단위 스크롤 선택) */}
        <section className="mb-8">
          <p className="text-[13px] font-semibold mb-2">연락 가능 시간</p>
          <div className="flex items-center gap-2">
            <TimeSelect value={startTime} onChange={setStartTime} />
            <span className="text-neutral-400 text-[13px]">-</span>
            <TimeSelect value={endTime} onChange={setEndTime} />
          </div>
        </section>

        {/* 문의 채널 관리는 요청대로 삭제 */}

        {/* 취소 정책 */}
        <section className="mb-8">
          <p className="text-[13px] font-semibold mb-2">
            취소 정책을 작성해주세요.
          </p>
          <div className="border border-neutral-200 rounded-md bg-neutral-50 px-3 py-2">
            <textarea
              rows={4}
              value={cancelPolicy}
              onChange={(e) => setCancelPolicy(e.target.value)}
              placeholder="예) 이용 3일 전까지는 전액 환불, 2일 전부터는 50% 환불 등 상세한 취소 규정을 작성해주세요."
              className="w-full bg-transparent text-[13px] outline-none resize-none placeholder:text-neutral-300"
            />
          </div>
        </section>

        {/* 업체 관련 사진 (UI 그대로 유지) */}
        <section className="mb-8">
          <p className="text-[13px] font-semibold mb-1">업체 관련 사진</p>
          <p className="text-[11px] text-neutral-400 mb-3">
            업체의 로고나 사진을 등록해주세요.
          </p>
          <button className="w-20 h-20 border border-dashed border-neutral-300 rounded-md flex flex-col items-center justify-center text-neutral-400 text-[11px] gap-1 bg-neutral-50">
            <span className="text-xl">📷</span>
            <span>0 / 1</span>
          </button>
        </section>

        {/* 상세 소개 */}
        <section className="mb-4">
          <p className="text-[13px] font-semibold mb-2">
            호스트에 대해 자세히 이야기해주세요.
          </p>

          <div className="border border-neutral-200 rounded-md p-3 bg-neutral-50 mb-2">
            <p className="text-[11px] text-neutral-500">
              이런 내용을 적어보세요!
            </p>
            <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
              무엇을 만드는 곳인지, 어떤 사람들과 함께하고 있는지, 이 일을
              시작하게 된 계기나 브랜드의 이야기를 들려주세요.
            </p>
          </div>

          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-neutral-200 rounded-md text-[13px] p-2 outline-none resize-none"
            placeholder="예) 이 호프집은 창업가 지원에서 만난 카카오 꽃부 디자이너와의 협업으로 시작되었습니다. ..."
          />
          <div className="mt-1 text-right text-[11px] text-neutral-400">
            {description.length} / 2000
          </div>
        </section>
      </main>

      {/* 하단 완료 버튼 */}
      <footer className="px-4 pb-6 pt-3 border-t border-neutral-100 bg-white">
        <button
          type="button"
          onClick={handleComplete}
          disabled={submitting}
          className={`w-full h-11 rounded-xl text-[14px] font-semibold ${
            submitting ? "bg-neutral-300" : "bg-neutral-300"
          } text-white`}
        >
          {submitting ? "저장 중..." : "완료"}
        </button>
      </footer>
    </div>
  );
}
