export default function PhonePreview({ src = "/app" }) {
  return (
    <div className="hidden lg:flex items-center justify-center bg-[#f6f7f8]">
      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="w-[420px] h-[844px] bg-white border border-[#e9eaec] overflow-hidden shadow-[0_14px_45px_rgba(0,0,0,0.09),_0_4px_18px_rgba(0,0,0,0.07)]">
          <iframe title="mobile" src={src} className="w-full h-full border-0" />
        </div>
      </div>
    </div>
  );
}
