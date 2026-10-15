import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LogIn, School, Mail, Lock, Sparkles } from "lucide-react";
import api from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [schoolSlug, setSchoolSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string }[] = [];
    const colors = ["#38bdf8", "#a78bfa", "#f472b6", "#34d399", "#fbbf24"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    let anim: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0f172a");
      g.addColorStop(0.5, "#1e1b4b");
      g.addColorStop(1, "#0f172a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p, i) => {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx * 0.00015;
          p.vy += dy * 0.00015;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - d / 120) * 0.25;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;
      anim = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        school_slug: schoolSlug,
        email,
        password,
      });
      setAuth(data.access_token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: "owner" | "teacher" | "student") => {
    setSchoolSlug("demo");
    if (role === "owner") {
      setEmail("owner@demo.uz");
      setPassword("owner123");
    } else if (role === "teacher") {
      setEmail("teacher@demo.uz");
      setPassword("teacher123");
    } else {
      setEmail("student@demo.uz");
      setPassword("student123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 w-full max-w-md glass-strong rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-block mb-2"
          >
            <Sparkles className="text-sky-400 mx-auto" size={32} />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Lumos
          </h1>
          <p className="text-white/60 mt-2">{t("auth.login_title")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-white/60 mb-1.5 flex items-center gap-2">
              <School size={14} /> {t("auth.school_slug")}
            </label>
            <input
              type="text"
              value={schoolSlug}
              onChange={(e) => setSchoolSlug(e.target.value)}
              placeholder="demo"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 flex items-center gap-2">
              <Mail size={14} /> {t("auth.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 flex items-center gap-2">
              <Lock size={14} /> {t("auth.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              required
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-sm text-center">
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? t("common.loading") : t("common.login")}
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/register" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
            {t("auth.create_school")} →
          </Link>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="text-xs text-white/40 hover:text-white/60 w-full text-center"
          >
            {showDemo ? "▲" : "▼"} {t("auth.demo_hint")}
          </button>
          {showDemo && (
            <div className="mt-2 p-3 rounded-xl bg-white/5 text-sm text-white/50 space-y-2">
              <button type="button" onClick={() => fillDemo("owner")} className="block w-full text-left hover:text-sky-300 transition-colors">
                owner@demo.uz / owner123
              </button>
              <button type="button" onClick={() => fillDemo("teacher")} className="block w-full text-left hover:text-sky-300 transition-colors">
                teacher@demo.uz / teacher123
              </button>
              <button type="button" onClick={() => fillDemo("student")} className="block w-full text-left hover:text-sky-300 transition-colors">
                student@demo.uz / student123
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
