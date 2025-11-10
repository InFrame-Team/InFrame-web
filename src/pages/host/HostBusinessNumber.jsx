import { useState } from "react";
import { useNavigate } from "react-router-dom";
import checkBusinessNumber from "../../apis/checkBusinessNumber";
import { MdArrowBackIosNew } from "react-icons/md";

export default function HostBusinessNumber() {
  const navigate = useNavigate();
  const [bizNo, setBizNo] = useState("");
  const [checking, setChecking] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState("");

  const onlyNumber = bizNo.replace(/[^0-9]/g, "");
  const isNextEnabled = isValid;

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setBizNo(value);
    setIsValid(false);
    setMessage("");
  };

  const handleCheck = async () => {
    if (onlyNumber.length !== 10) {
      setMessage("사업자 번호는 10자리 숫자여야 합니다.");
      setIsValid(false);
      return;
    }

    setChecking(true);
    setMessage("");

    const { success, message } = await checkBusinessNumber(onlyNumber);

    setIsValid(success);
    setMessage(message);
    setChecking(false);
  };

  // ✅ 여기서는 단순히 businessNumber를 다음 페이지로 넘기기만 함
  const handleNext = () => {
    if (!isNextEnabled) return;

    navigate("/host/basic-info", {
      state: { businessNumber: onlyNumber }, // 다음 페이지로 전달
    });
  };
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 */}
      <header className="pt-4 px-4 flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="text-xl">
          <MdArrowBackIosNew />
        </button>

        <div className="flex justify-center flex-1">
          <div className="relative w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 w-1/3 h-full bg-[#e64a45] rounded-full" />
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="px-6 flex-1">
        <h1 className="text-[22px] font-bold mb-8 mt-20 leading-snug">
          사업자 번호를 입력하세요
        </h1>

        <div className="mb-2">
          <span className="text-[14px] text-neutral-800">
            사업자 번호 <span className="text-[#e64a45]">*</span>
          </span>
        </div>

        <div className="relative mb-6">
          <input
            type="tel"
            inputMode="numeric"
            value={bizNo}
            onChange={handleChange}
            placeholder="숫자만 입력"
            className="w-full outline-none text-[16px] pb-2 pr-[80px]"
          />

          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className={`absolute right-0 top-0 px-4 py-1.5 rounded-full text-[13px] border transition-all ${
              checking
                ? "bg-neutral-100 text-neutral-400 cursor-wait"
                : "bg-[#f3f3f3] text-[#9a9a9a] border-transparent hover:bg-white hover:text-[#e64a45] hover:border-[#e64a45]"
            }`}
          >
            {checking ? "조회 중..." : "조회"}
          </button>

          <div className="h-[1px] w-full bg-neutral-200 mt-1" />
        </div>

        {message && (
          <p
            className={`mt-2 text-[13px] ${
              isValid ? "text-[#1a7f37]" : "text-[#e64a45]"
            }`}
          >
            {message}
          </p>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="px-4 pb-8">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isNextEnabled}
          className={`w-full h-12 rounded-xl text-[15px] font-semibold ${
            isNextEnabled
              ? "bg-[#e64a45] text-white"
              : "bg-neutral-300 text-white"
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
