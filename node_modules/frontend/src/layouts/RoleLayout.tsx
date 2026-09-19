import React, { useState } from "react";
import { Badge, Button, Drawer, Tooltip } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleConfig } from "../lib/roleConfig";
import { GlobalSearch } from "../components/ui/GlobalSearch";
import { ProfileModal } from "../components/ui/ProfileModal";
import { NotificationPopover } from "../components/ui/NotificationPopover";
import { MessagerieDrawer } from "../components/messaging/MessagerieDrawer";
import {
  DashboardOutlined,
  FileTextOutlined,
  IdcardOutlined,
  SolutionOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  AuditOutlined,
  UserOutlined,
  LogoutOutlined,
  MessageOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import "./RoleLayout.css";

const menuIconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  "carte-parkings": <EnvironmentOutlined />,
  demandes: <FileTextOutlined />,
  abonnements: <SolutionOutlined />,
  factures: <FileDoneOutlined />,
  cartes: <IdcardOutlined />,
  contrats: <FileProtectOutlined />,
  recettes: <FileDoneOutlined />,
  utilisateurs: <TeamOutlined />,
  parkings: <EnvironmentOutlined />,
  tarifs: <TagsOutlined />,
  logs: <AuditOutlined />,
};

export function RoleLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userName, logout } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [messagerieOpen, setMessagerieOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Foldable/Collapsible sidebar state with local storage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("rrm_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("rrm_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  if (!role) return null;

  const config = roleConfig[role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const selectedKey = config.menuItems.find((item) =>
    location.pathname.startsWith(item.path) && item.path !== config.homePath
  )?.key ?? (location.pathname === config.homePath ? "dashboard" : undefined);

  return (
    <div className="bg-[#f7f9fb] text-slate-900 font-body-md min-h-screen relative overflow-x-hidden selection:bg-secondary selection:text-white">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-0 left-[20%] w-[500px] h-[500px] rounded-full bg-sky-400/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>

      {/* 1. FULL-WIDTH TOP APP BAR */}
      <header className="fixed top-0 left-0 w-full h-[64px] border-b border-slate-200/80 shadow-2xs flex justify-between items-center px-4 md:px-6 z-50 bg-white/90 backdrop-blur-md">
        {/* Left Side: Mobile Menu Button & RRM Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20, color: "#003566" }} />}
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden flex items-center justify-center p-1"
          />

          {/* RRM Logo */}
          <div
            className="flex items-center cursor-pointer ml-1"
            onClick={() => navigate(config.homePath)}
          >
            <img
              src="/pictures/logo-rrm.png"
              alt="Rabat Région Mobilité"
              className="h-8 md:h-9 object-contain"
            />
          </div>
        </div>

        {/* Center: Search Bar Centered in Middle of Header (Desktop Only) */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-auto px-4">
          <div className="w-full">
            <GlobalSearch />
          </div>
        </div>

        {/* Right Side: Trailing Action Controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Internal Team Messaging */}
          <Badge count={1} dot color="#0284c7">
            <Button
              shape="circle"
              icon={<MessageOutlined style={{ fontSize: 16, color: "#003566" }} />}
              title="Messagerie Interne Équipe"
              onClick={() => setMessagerieOpen(true)}
              className="border-slate-200 bg-slate-50 hover:bg-white shadow-xs"
            />
          </Badge>

          {/* Notification Popover */}
          <NotificationPopover />
        </div>
      </header>

      {/* 2. DESKTOP SIDEBAR NAVIGATION (Foldable with Smooth Transition) */}
      <aside
        className={`hidden md:flex fixed left-0 top-[64px] h-[calc(100vh-64px)] border-r border-slate-200/80 shadow-2xs flex-col py-5 z-40 bg-white/85 backdrop-blur-3xl transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        {/* Top of Sidebar: User Info Badge & Fold/Unfold Toggle Button */}
        <div
          className={`flex items-center mb-5 pb-3 border-b border-slate-100 transition-all duration-300 ${
            isCollapsed
              ? "flex-col gap-3 px-2 items-center"
              : "justify-between px-5 gap-2"
          }`}
        >
          {/* User Info Badge */}
          <div
            className={`flex items-center cursor-pointer min-w-0 ${
              isCollapsed ? "justify-center" : "gap-3 flex-1"
            }`}
            onClick={() => navigate(config.homePath)}
          >
            <Tooltip
              title={isCollapsed ? `${userName ?? "Agent RRM"} (${config.title})` : ""}
              placement="right"
            >
              <div className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-black text-sm shrink-0 shadow-2xs">
                {userName ? userName.charAt(0).toUpperCase() : "A"}
              </div>
            </Tooltip>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-xs font-extrabold text-slate-900 truncate m-0 leading-tight">
                  {userName ?? "Agent RRM"}
                </h1>
                <p className="text-[10px] font-semibold text-slate-500 truncate m-0">
                  {config.title}
                </p>
              </div>
            )}
          </div>

          {/* Fold / Unfold Toggle Button at the top of the sidebar */}
          <Tooltip
            title={isCollapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
            placement={isCollapsed ? "right" : "bottom"}
          >
            <Button
              type="text"
              icon={
                isCollapsed ? (
                  <MenuUnfoldOutlined style={{ fontSize: 16, color: "#003566" }} />
                ) : (
                  <MenuFoldOutlined style={{ fontSize: 16, color: "#003566" }} />
                )
              }
              onClick={toggleSidebar}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 border-none cursor-pointer transition-all shrink-0"
            />
          </Tooltip>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1 custom-scrollbar">
          {config.menuItems.map((item) => {
            const isSelected = selectedKey === item.key;
            const icon = menuIconMap[item.key] || <DashboardOutlined />;

            const buttonEl = (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`flex items-center rounded-xl transition-all duration-200 text-xs font-extrabold cursor-pointer border-none text-left w-full ${
                  isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-2.5"
                } ${
                  isSelected
                    ? "text-secondary border-l-4 border-secondary bg-secondary/10 shadow-xs scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-0.5"
                }`}
              >
                <span className="text-base shrink-0">{icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );

            return isCollapsed ? (
              <Tooltip key={item.key} title={item.label} placement="right">
                {buttonEl}
              </Tooltip>
            ) : (
              buttonEl
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div
          className={`mt-auto flex flex-col gap-1 pt-4 border-t border-slate-200/80 transition-all duration-300 ${
            isCollapsed ? "px-2 mx-1 items-center" : "px-3 mx-3"
          }`}
        >
          {isCollapsed ? (
            <>
              <Tooltip title="Mon Profil" placement="right">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center justify-center text-slate-600 hover:text-slate-900 w-10 h-10 rounded-xl hover:bg-slate-100 transition-all border-none bg-transparent cursor-pointer"
                >
                  <UserOutlined className="text-base" />
                </button>
              </Tooltip>
              <Tooltip title="Déconnexion" placement="right">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center text-rose-600 hover:text-rose-700 w-10 h-10 rounded-xl hover:bg-rose-50 transition-all border-none bg-transparent cursor-pointer"
                >
                  <LogoutOutlined className="text-base" />
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-3 text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-all text-xs font-bold border-none bg-transparent cursor-pointer w-full text-left"
              >
                <UserOutlined className="text-base" />
                <span>Mon Profil</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-rose-600 hover:text-rose-700 px-4 py-2.5 rounded-xl hover:bg-rose-50 transition-all text-xs font-extrabold border-none bg-transparent cursor-pointer w-full text-left"
              >
                <LogoutOutlined className="text-base" />
                <span>Déconnexion</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* 3. MOBILE NAVIGATION DRAWER */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <img src="/pictures/logo-rrm.png" alt="RRM" className="h-7 object-contain" />
            <span className="text-xs font-extrabold text-slate-900">{config.title}</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={280}
        styles={{ body: { padding: "16px 12px" } }}
      >
        <div className="flex flex-col h-full gap-4">
          <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-black text-xs shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">{userName ?? "Agent RRM"}</div>
              <div className="text-[10px] text-slate-500 truncate">{config.title}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1">
            {config.menuItems.map((item) => {
              const isSelected = selectedKey === item.key;
              const icon = menuIconMap[item.key] || <DashboardOutlined />;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.path);
                    setMobileDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-extrabold cursor-pointer border-none text-left w-full ${
                    isSelected
                      ? "text-secondary border-l-4 border-secondary bg-secondary/10 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-base shrink-0">{icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-1">
            <button
              onClick={() => {
                setProfileModalOpen(true);
                setMobileDrawerOpen(false);
              }}
              className="flex items-center gap-3 text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-all text-xs font-bold border-none bg-transparent cursor-pointer w-full text-left"
            >
              <UserOutlined className="text-base" />
              <span>Mon Profil</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-rose-600 hover:text-rose-700 px-4 py-2.5 rounded-xl hover:bg-rose-50 transition-all text-xs font-extrabold border-none bg-transparent cursor-pointer w-full text-left"
            >
              <LogoutOutlined className="text-base" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Main Content Canvas — Dynamically adjusts left padding based on folded/unfolded sidebar */}
      <main
        className={`pt-[68px] md:pt-[72px] pb-8 px-3 md:px-6 relative z-10 min-w-0 max-w-full transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:pl-[96px]" : "md:pl-[280px]"
        }`}
      >
        <Outlet />
      </main>

      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <MessagerieDrawer open={messagerieOpen} onClose={() => setMessagerieOpen(false)} />
    </div>
  );
}
