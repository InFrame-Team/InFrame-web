import React from "react";
import Landing from "./Landing";
import StartPage from "./StartPage";

export default function RootEntry() {
  // 모바일 체크
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    return <StartPage />;
  }

  return <Landing />;
}
