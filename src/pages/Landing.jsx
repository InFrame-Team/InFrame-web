import QRCode from "react-qr-code";
import PhonePreview from "../components/PhonePreview";

const base =
  import.meta.env.DEV && import.meta.env.VITE_DEV_HOST
    ? `http://${import.meta.env.VITE_DEV_HOST}:${
        import.meta.env.VITE_DEV_PORT || 5175
      }`
    : typeof window !== "undefined"
    ? window.location.origin
    : "";

export default function Landing() {
  const appUrl = `${base}/app`;

  return (
    <div className="relative min-h-screen bg-[#f7f7f7]">
      {/* 바닥 붉은 띠 */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 h-[18px] bg-[#e64a45]" />

      {/* 전체 레이아웃 */}
      <div className="mx-auto min-h-screen max-w-[1220px] grid grid-cols-1 lg:grid-cols-[1fr_420px]">
        {/* ===== 왼쪽 영역 ===== */}
        <section className="relative flex flex-col px-8 sm:px-12 lg:px-20 py-12 lg:py-16">
          {/* 로고 */}
          <img
            src="/inframe-logo.png"
            alt="in경산 로고"
            className="sm:w-[300px] h-30 object-contain mt-12 lg:mt-[8vh]"
          />

          {/* 대제목 — 상단 마진 추가로 콘텐츠를 아래로 내림 */}
          <h1 className="lg:mt-[6vh] text-[40px] sm:text-[46px] lg:text-[50px] leading-[1.25] font-pretendard font-semibold text-[#1D1D1D] mb-16">
            이미 장소의 시대는 끝났다,
            <br />
            지금은 사람의 여행!
          </h1>

          {/* 설명 + QR */}
          <div className="flex items-start justify-between mb-24">
            <p className="text-[#3A3A3A] text-[20px] font-medium leading-8 max-w-[540px]">
              지도 위의 점 대신, 사람의 얼굴이 있습니다.
              <br />
              한 걸음마다 이야기가 이어지고,
              <br />
              당신의 여행은 하나의 만남이 됩니다.
              <br />
              <br />
              지금, 사람을 만나러 떠나보세요.
            </p>

            <div className="pr-5">
              <QRCode value={appUrl} size={150} />
            </div>
          </div>
        </section>

        {/* ===== 오른쪽 영역: 폰 프리뷰 ===== */}
        <aside
          className="
            hidden lg:flex
            lg:sticky lg:top-8      
            overflow-visible     
            justify-center
            pr-[max(env(safe-area-inset-right),8px)] 
          "
        >
          <PhonePreview src="/register-host" />
        </aside>
      </div>
    </div>
  );
}
