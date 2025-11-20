import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import startLogo from "../assets/startLogo.png";

export default function StartPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/signin");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center">
      <div className="w-full max-w-[480px] relative overflow-hidden">
        <div className="h-[100dvh] flex items-center justify-center">
          <img src={startLogo} alt="in경산" className="w-[120px] h-auto" />
        </div>
      </div>
    </div>
  );
}
