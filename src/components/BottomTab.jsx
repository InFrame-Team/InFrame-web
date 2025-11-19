import { useLocation, useNavigate } from "react-router-dom";
import { HiHome } from "react-icons/hi";
import { MdStars } from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";
import { FaUser } from "react-icons/fa6";

export default function BottomTab() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "홈", icon: HiHome, path: "/app" },
    { label: "탐색", icon: MdStars, path: "/explore" },
    { label: "인물지도", icon: IoLocationSharp, path: "/map" },
    { label: "마이페이지", icon: FaUser, path: "/register-host" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-neutral-200 z-20 h-[60px]">
      <div className="grid grid-cols-4 h-full text-[9px] px-4">
        {tabs.map((t, i) => {
          const isActive = location.pathname.startsWith(t.path);
          const Icon = t.icon;

          return (
            <button
              key={i}
              type="button"
              onClick={() => navigate(t.path)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 ${
                isActive
                  ? "text-[#222222]"
                  : "text-[#c5c5c5] hover:text-[#222222]"
              }`}
            >
              <Icon size={22} />
              <span className={isActive ? "font-semibold" : ""}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
