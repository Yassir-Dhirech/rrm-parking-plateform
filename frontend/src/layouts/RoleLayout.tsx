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
  PrinterOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import "./RoleLayout.css";

const menuIconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  "recherche-demandes": <FileTextOutlined />,
  paiements: <FileDoneOutlined />,
  "carte-parkings": <EnvironmentOutlined />,
  "nouvel-abonnement": <SolutionOutlined />,
  demandes: <FileTextOutlined />,
  "demandes-corporate": <TeamOutlined />,
  "demandes-validees": <FileDoneOutlined />,
  abonnements: <SolutionOutlined />,
  "base-clients": <TeamOutlined />,
  factures: <FileDoneOutlined />,
  cartes: <IdcardOutlined />,
  "impressions-cartes": <PrinterOutlined />,
  "remises-cartes": <CheckCircleOutlined />,
  "activations-cartes": <SafetyCertificateOutlined />,
  historique: <HistoryOutlined />,
  contrats: <FileProtectOutlined />,
  recettes: <DollarCircleOutlined />,
  utilisateurs: <TeamOutlined />,
  parkings: <EnvironmentOutlined />,
  tarifs: <TagsOutlined />,
  logs: <AuditOutlined />,
};

export function RoleLayout() {
  const navigate = useNavigate();
  const location = useLocation();
const {
  role,
  userName,
  logout,
  hasAuthority,
} = useAuth();
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

  const visibleMenuItems = config.menuItems.filter(
    (item) =>
      !item.requiredAuthority
      || hasAuthority(item.requiredAuthority),
  );

  const menuItems = config.menuItems.filter(
    (item) =>
      !item.requiredAuthority
      || hasAuthority(item.requiredAuthority),
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const selectedKey =
    [...visibleMenuItems]
      .sort((a, b) => b.path.length - a.path.length)
      .find((item) =>
        item.path === config.homePath
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path),
      )?.key;


  const currentPageTitle =
    selectedKey === "dashboard"
      ? "Dashboard"
      : visibleMenuItems.find((item) => item.key === selectedKey)?.label ?? "Dashboard";
return (
    <div
      className={`rrm-role-shell bg-[#f7f9fb] text-slate-900 font-body-md min-h-screen relative overflow-x-hidden selection:bg-secondary selection:text-white ${
        role === "RESPONSABLE" ? "rrm-role-shell--glass" : ""
      }`}
    >
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-0 left-[20%] w-[500px] h-[500px] rounded-full bg-sky-400/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>
      {/* 1. TOP BAR */}
      {role === "RESPONSABLE" ? (
        <header
          className={`rrm-responsable-topbar fixed top-0 right-0 h-[76px] z-50 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ease-in-out ${
            isCollapsed ? "md:left-[96px]" : "md:left-[280px]"
          }`}
        >
          {/* Left: page title */}
          <div className="rrm-responsable-topbar-left flex items-center gap-2 min-w-0">
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setMobileDrawerOpen(true)}
              className="rrm-responsable-mobile-menu md:hidden"
            />

            <Tooltip title={isCollapsed ? "Déplier le menu" : "Replier le menu"}>
              <Button
                type="text"
                icon={
                  isCollapsed ? (
                    <MenuUnfoldOutlined style={{ fontSize: 18, color: "#ffffff" }} />
                  ) : (
                    <MenuFoldOutlined style={{ fontSize: 18, color: "#ffffff" }} />
                  )
                }
                onClick={toggleSidebar}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shrink-0 cursor-pointer"
              />
            </Tooltip>

            <h1 className="rrm-responsable-page-title truncate">
              {currentPageTitle}
            </h1>
          </div>

          {/* Right: user identity + communication actions */}
          <div className="rrm-responsable-topbar-right flex items-center">
            <button
              type="button"
              className="rrm-responsable-user-summary"
              onClick={() => setProfileModalOpen(true)}
              title="Ouvrir mon profil"
            >
              <span className="rrm-responsable-user-avatar">
                <UserOutlined />
              </span>

              <span className="rrm-responsable-user-copy">
                <strong>{userName ?? "Responsable RRM"}</strong>
                <small>Espace Responsable</small>
              </span>
            </button>

            <Badge count={1} dot color="#ffffff">
              <Button
                shape="circle"
                icon={<MessageOutlined />}
                title="Messagerie interne"
                onClick={() => setMessagerieOpen(true)}
                className="rrm-responsable-topbar-icon"
              />
            </Badge>

            <div className="rrm-responsable-notification-action">
              <NotificationPopover />
            </div>
          </div>
        </header>
      ) : (
        <header className="fixed top-0 left-0 w-full h-[64px] border-b border-slate-200/80 shadow-2xs flex justify-between items-center px-4 md:px-6 z-50 bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: "#003566" }} />}
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden flex items-center justify-center p-1"
            />

            

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

          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-auto px-4">
            <div className="w-full">
              <GlobalSearch />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Badge count={1} dot color="#0284c7">
              <Button
                shape="circle"
                icon={<MessageOutlined style={{ fontSize: 16, color: "#003566" }} />}
                title="Messagerie Interne Équipe"
                onClick={() => setMessagerieOpen(true)}
                className="border-slate-200 bg-slate-50 hover:bg-white shadow-xs"
              />
            </Badge>

            <NotificationPopover />
          </div>
        </header>
      )}
      {/* 2. DESKTOP SIDEBAR NAVIGATION (Foldable with Smooth Transition) */}
      <aside
        className={`hidden md:flex fixed left-0 top-[64px] h-[calc(100vh-64px)] border-r border-slate-200/80 shadow-2xs flex-col pt-2 pb-3 z-40 bg-white/95 backdrop-blur-3xl transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[76px] rrm-sidebar--collapsed" : "w-[260px] rrm-sidebar--expanded"
        }`}
      >
        {/* Top of Sidebar: Slim fold / unfold header */}
        <div
          className={`flex items-center mb-1.5 px-3 py-1 border-b transition-all duration-300 ${
            role === "RESPONSABLE" ? "border-white/10" : "border-slate-100"
          } ${isCollapsed ? "justify-center px-1" : "justify-between"}`}
        >
          {!isCollapsed && (
            <span
              className={`text-[10.5px] font-black uppercase tracking-wider select-none ${
                role === "RESPONSABLE" ? "text-white/60" : "text-slate-400"
              }`}
            >
              Menu
            </span>
          )}

          <Tooltip
            title={isCollapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
            placement={isCollapsed ? "right" : "bottom"}
          >
            <Button
              type="text"
              icon={
                isCollapsed ? (
                  <MenuUnfoldOutlined
                    style={{
                      fontSize: 15,
                      color: role === "RESPONSABLE" ? "#ffffff" : "#003566",
                    }}
                  />
                ) : (
                  <MenuFoldOutlined
                    style={{
                      fontSize: 15,
                      color: role === "RESPONSABLE" ? "#ffffff" : "#003566",
                    }}
                  />
                )
              }
              onClick={toggleSidebar}
              className={`rrm-sidebar-toggle-button flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all shrink-0 ${
                role === "RESPONSABLE"
                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80"
              }`}
            />
          </Tooltip>
        </div>

        {/* Main Navigation Items (Starts right at the top!) */}
        <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-1 justify-start custom-scrollbar">
          {menuItems.map((item) => {
            const isSelected = selectedKey === item.key;
            const icon = menuIconMap[item.key] || <DashboardOutlined />;

            const buttonEl = (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`rrm-sidebar-nav-button flex items-center rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer border-none text-left w-full ${
                  isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5"
                } ${
                  isSelected
                    ? "rrm-sidebar-nav-button--active shadow-xs"
                    : "hover:translate-x-0.5"
                }`}
              >
                <span className={`${isCollapsed ? "text-lg" : "text-base"} shrink-0 flex items-center justify-center`}>
                  {icon}
                </span>
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
          className={`mt-auto flex flex-col gap-1 pt-3 border-t border-slate-200/80 transition-all duration-300 ${
            isCollapsed ? "px-1.5 items-center" : "px-3 mx-2"
          }`}
        >
          {isCollapsed ? (
            <>
              <Tooltip title="Mon Profil" placement="right">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="rrm-sidebar-footer-button flex items-center justify-center w-9 h-9 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                >
                  <UserOutlined className="text-base" />
                </button>
              </Tooltip>
              <Tooltip title="Déconnexion" placement="right">
                <button
                  onClick={handleLogout}
                  className="rrm-sidebar-footer-button rrm-sidebar-footer-button--logout flex items-center justify-center w-9 h-9 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                >
                  <LogoutOutlined className="text-base" />
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="rrm-sidebar-footer-button flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all text-xs font-bold border-none bg-transparent cursor-pointer w-full text-left"
              >
                <UserOutlined className="text-base" />
                <span>Mon Profil</span>
              </button>
              <button
                onClick={handleLogout}
                className="rrm-sidebar-footer-button rrm-sidebar-footer-button--logout flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all text-xs font-bold border-none bg-transparent cursor-pointer w-full text-left"
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
        rootClassName={role === "RESPONSABLE" ? "rrm-mobile-drawer--glass" : undefined}
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
            {menuItems.map((item) => {
              const isSelected = selectedKey === item.key;
              const icon = menuIconMap[item.key] || <DashboardOutlined />;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.path);
                    setMobileDrawerOpen(false);
                  }}
                  className={`rrm-mobile-sidebar-nav-button flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-extrabold cursor-pointer border-none text-left w-full ${
                    isSelected
                      ? "rrm-mobile-sidebar-nav-button--active shadow-xs"
                      : ""
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
              className="rrm-mobile-sidebar-footer-button flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-xs font-bold border-none bg-transparent cursor-pointer w-full text-left"
            >
              <UserOutlined className="text-base" />
              <span>Mon Profil</span>
            </button>
            <button
              onClick={handleLogout}
              className="rrm-mobile-sidebar-footer-button rrm-mobile-sidebar-footer-button--logout flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-xs font-extrabold border-none bg-transparent cursor-pointer w-full text-left"
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
          isCollapsed ? "md:pl-[92px]" : "md:pl-[276px]"
        }`}
      >
        <Outlet />
      </main>

      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <MessagerieDrawer open={messagerieOpen} onClose={() => setMessagerieOpen(false)} />
    </div>
  );
}
