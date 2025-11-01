import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { useSignup } from "../../../contexts/SignupContext";
import { checkNickname } from "../../../apis/auth";

export default function Nickname() {
  const navigate = useNavigate();
  const { data, setData } = useSignup();
  const [loading, setLoading] = React.useState(false);

  // 닉네임 입력 시 이전 확인 결과 리셋
  const onChangeNickname = (e) => {
    setData({
      nickname: e.target.value,
      nicknameChecked: null,
      nicknameCheckMsg: "",
    });
  };

  // 닉네임 중복확인
  const onCheck = async () => {
    const nickname = data.nickname.trim();
    if (!nickname) return alert("닉네임을 입력해주세요.");

    try {
      setLoading(true);
      const res = await checkNickname(nickname);
      setData({
        nicknameChecked: res.available,
        nicknameCheckMsg: res.message,
      });
    } catch (error) {
      setData({
        nicknameChecked: false,
        nicknameCheckMsg: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (data.nicknameChecked !== true) return;
    navigate("/signup/account");
  };

  const isNextEnabled = data.nicknameChecked === true;

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative">
        {/* 뒤로가기 */}
        <header className="sticky top-0 z-10 bg-white">
          <div className="px-4 py-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[18px] text-[#3A3A3A]"
            >
              <IoChevronBack size={24} />
            </button>
          </div>
        </header>

        {/* 본문 */}
        <main className="px-5 pt-12 pb-28">
          <h1 className="text-[26px] font-bold text-[#3A3A3A]">
            닉네임을 입력해주세요
          </h1>

          <label className="mt-12 pl-1 block text-[15px] text-[#3A3A3A] font-medium">
            닉네임 <span className="text-[#F13030]">*</span>
          </label>

          {/* 입력 + 중복확인 */}
          <div className="mt-2 flex items-center border-b border-[#E9E9E9]">
            <input
              type="text"
              value={data.nickname}
              onChange={onChangeNickname}
              className="flex-1 bg-transparent border-0 outline-none px-1 py-2 text-[15px] text-[#3A3A3A]"
            />
            <button
              type="button"
              onClick={onCheck}
              disabled={
                loading ||
                !data.nickname.trim() ||
                data.nicknameChecked === true
              }
              className={`ml-2 mr-1 px-[14px] py-1.5 mb-2 text-[13px] font-semibold rounded-full border ${
                data.nicknameChecked === true
                  ? "bg-[#E9E9EC] text-[#99A0B0] cursor-not-allowed"
                  : "text-[#F13030] border-[#F13030] bg-white hover:opacity-80"
              }`}
            >
              {loading
                ? "확인중..."
                : data.nicknameChecked === true
                ? "확인완료"
                : "중복확인"}
            </button>
          </div>

          {/* 결과 메시지 */}
          {data.nicknameCheckMsg && (
            <p
              className={`mt-2 ml-1 text-[13px] ${
                data.nicknameChecked === true
                  ? "text-green-600"
                  : data.nicknameChecked === false
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {data.nicknameCheckMsg}
            </p>
          )}
        </main>

        {/* 다음 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur px-6 pb-6 pt-3">
          <button
            type="button"
            disabled={!isNextEnabled}
            onClick={goNext}
            className={`w-full rounded-[8px] text-white text-[14px] font-semibold py-3 transition ${
              isNextEnabled
                ? "bg-[#F13030] hover:bg-[#e02d2d] active:bg-[#e02d2d]"
                : "bg-[#E9E9EC] text-[#99A0B0] cursor-not-allowed"
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
