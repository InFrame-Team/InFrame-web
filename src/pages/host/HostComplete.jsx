import { useNavigate, useLocation } from "react-router-dom";
import completeImg from "../../assets/host-complete.png";

export default function HostComplete() {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate("/host/map");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 */}
      <header className="pt-4 px-4 flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="text-2xl">
          ‹
        </button>

        <div className="flex justify-center flex-1">
          <div className="relative w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-[#e64a45] rounded-full" />
          </div>
        </div>
      </header>

      {/* 메인 내용 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <img
          src={completeImg}
          alt="호스트 가입 완료"
          className="w-[400px] mb-10"
        />

        <h1 className="text-[24px] font-bold mb-3">축하합니다!</h1>

        <p className="text-[21px] text-center leading-relaxed">
          호스트로서 세상에 당신의
          <br />
          이야기를 들려주세요
        </p>
      </main>

      {/* 하단 버튼 */}
      <div className="px-4 pb-8">
        <button
          type="button"
          onClick={handleGoToProfile}
          className="w-full h-12 rounded-xl text-[15px] font-semibold bg-[#e64a45] text-white"
        >
          호스트 설정 바로가기
        </button>
      </div>
    </div>
  );
}
