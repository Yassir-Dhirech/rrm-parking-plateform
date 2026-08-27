import React, { useState } from "react";
import { Badge, Button } from "antd";
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
  CreditCardOutlined,
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
} from "@ant-design/icons";
import "./RoleLayout.css";

const menuIconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  "carte-parkings": <EnvironmentOutlined />,
  demandes: <FileTextOutlined />,
  abonnements: <SolutionOutlined />,
  paiements: <CreditCardOutlined />,
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
      {/* Ambient Radial Background Glows (absolute positioned so they float in background without occupying flow height) */}
      <div className="absolute top-0 left-[20%] w-[500px] h-[500px] rounded-full bg-sky-400/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>

      {/* 1. FULL-WIDTH TOP APP BAR (Simple, Clean, Fixed 64px Header) */}
      <header className="fixed top-0 left-0 w-full h-[64px] border-b border-slate-200/80 shadow-2xs flex justify-between items-center px-6 z-50 bg-white/90 backdrop-blur-md transition-all">
        {/* Left Side: RRM Logo at Very Left */}
        <div className="flex items-center shrink-0">
          <img
            src="/pictures/logo-rrm.png"
            alt="Rabat Région Mobilité"
            className="h-9 object-contain cursor-pointer"
            onClick={() => navigate(config.homePath)}
          />
        </div>

        {/* Center: Search Bar Centered in Middle of Header */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-auto px-4">
          <div className="w-full">
            <GlobalSearch />
          </div>
        </div>

        {/* Right Side: Trailing Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Parking Map Access */}
          <Button
            type="primary"
            icon={<EnvironmentOutlined style={{ fontSize: 14 }} />}
            onClick={() => navigate(`${config.homePath}/carte-parkings`)}
            className="bg-secondary hover:bg-secondary/90 text-white font-extrabold border-none rounded-xl shadow-2xs text-xs flex items-center gap-1.5"
          >
            <span className="hidden sm:inline">Carte des Parkings</span>
          </Button>

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

      {/* 2. SIDEBAR NAVIGATION (Starts BELOW top header at top-[64px]) */}
      <aside className="hidden md:flex fixed left-0 top-[64px] h-[calc(100vh-64px)] w-[260px] border-r border-slate-200/80 shadow-2xs flex-col py-6 z-40 bg-white/85 backdrop-blur-3xl">
        {/* User Info Badge */}
        <div className="px-6 mb-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate(config.homePath)}>
          <div className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-black text-sm shrink-0 shadow-2xs">
            {userName ? userName.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xs font-extrabold text-slate-900 truncate m-0 leading-tight">
              {userName ?? "Agent RRM"}
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 truncate m-0">
              {config.title}
            </p>
          </div>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1 custom-scrollbar">
          {config.menuItems.map((item) => {
            const isSelected = selectedKey === item.key;
            const icon = menuIconMap[item.key] || <DashboardOutlined />;

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-xs font-extrabold cursor-pointer border-none text-left w-full ${
                  isSelected
                    ? "text-secondary border-l-4 border-secondary bg-secondary/10 shadow-xs scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-1"
                }`}
              >
                <span className="text-base shrink-0">{icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="mt-auto px-3 flex flex-col gap-1 pt-4 border-t border-slate-200/80 mx-3">
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
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="pt-[80px] pb-10 px-6 md:pl-[284px] md:pr-6 relative z-10 space-y-6">
        <Outlet />
      </main>

      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <MessagerieDrawer open={messagerieOpen} onClose={() => setMessagerieOpen(false)} />
    </div>
  );
}
