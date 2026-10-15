import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, BookOpen, Wallet,
  Users, GraduationCap, LogOut, Menu, X, ClipboardCheck
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../stores/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navItems = [
  { to: "/", icon: LayoutDashboard, key: "dashboard", roles: ["owner", "teacher", "student"] },
  { to: "/schedule", icon: Calendar, key: "schedule", roles: ["owner", "teacher", "student"] },
  { to: "/grades", icon: BookOpen, key: "grades", roles: ["owner", "teacher", "student"] },
  { to: "/attendance", icon: ClipboardCheck, key: "attendance", roles: ["owner", "teacher", "student"] },
  { to: "/debts", icon: Wallet, key: "debts", roles: ["owner", "teacher", "student"] },
  { to: "/students", icon: Users, key: "students", roles: ["owner", "teacher"] },
  { to: "/courses", icon: GraduationCap, key: "courses", roles: ["owner", "teacher", "student"] },
];

export function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col glass-strong border-r border-white/10">
        <div className="p-6">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            Lumos
          </motion.h1>
          <p className="text-xs text-white/50 mt-1">{user?.full_name}</p>
          <p className="text-xs text-sky-400/80">{t(`roles.${user?.role}`)}</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {filteredNav.map((item, i) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} className="flex items-center gap-3 w-full">
                <item.icon size={18} />
                <span className="font-medium">{t(`nav.${item.key}`)}</span>
              </motion.div>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-3">
          <LanguageSwitcher />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut size={18} />
            <span>{t("common.logout")}</span>
          </motion.button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">Lumos</h1>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 pt-16 bg-slate-950/95 backdrop-blur-xl">
            <nav className="p-4 space-y-2">
              {filteredNav.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl ${isActive ? "bg-sky-500/20 text-sky-300" : "text-white/70"}`
                  }>
                  <item.icon size={18} />
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))}
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400">
                <LogOut size={18} />
                {t("common.logout")}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
