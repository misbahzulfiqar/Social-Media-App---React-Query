import { Outlet } from "react-router-dom";

import { Bottombar, LeftSidebar, Topbar } from "@/components/shared";

const RootLayout = () => {
  return (
    <div className="app-shell">
      <LeftSidebar />
      <div className="app-main">
        <Topbar />
        <div className="app-outlet">
          <Outlet />
        </div>
        <Bottombar />
      </div>
    </div>
  );
};

export default RootLayout;
