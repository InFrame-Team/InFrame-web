import React, { useEffect } from "react";

export default function BaseAppSheet({
  open,
  title,
  onClose,
  topOffsetPx = 56,
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const original = {
      position: document.body.style.position,
      top: document.body.style.top,
      overflow: document.body.style.overflow,
      width: document.body.style.width,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = original.position;
      document.body.style.top = original.top;
      document.body.style.overflow = original.overflow;
      document.body.style.width = original.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* 앱 프레임만 어둡게 */}
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-black/40"
        onClick={onClose}
      />
      {/* 헤더 아래부터 하단까지 시트 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white rounded-t-[16px] shadow-xl flex flex-col overscroll-contain"
        style={{ top: `${topOffsetPx}px`, bottom: 0 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative h-16 flex items-center mt-3 ml-6">
          <h2 className="text-left text-[20px] font-bold text-[#3A3A3A]">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 text-[#3A3A3A] text-[32px]"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>

        <div className="px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] bg-white">
          {footer}
        </div>
      </div>
    </div>
  );
}
