import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { School, User, Mail, Lock, ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    school_name: "",
    school_slug: "",
    owner_full_name: "",
    owner_email: "",
    owner_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register-school", form);
      setSuccess(t("auth.register_success"));
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || t("auth.register_error"));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "school_name", label: t("auth.school_name"), icon: School, type: "text" },
    { key: "school_slug", label: t("auth.school_slug_label"), icon: School, type: "text" },
    { key: "owner_full_name", label: t("auth.owner_name"), icon: User, type: "text" },
    { key: "owner_email", label: t("auth.owner_email"), icon: Mail, type: "email" },
    { key: "owner_password", label: t("auth.owner_password"), icon: Lock, type: "password" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <div className="absolute top-6 right-6"><LanguageSwitcher /></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong rounded-3xl p-8"
      >
        <Link to="/login" className="text-sm text-white/50 hover:text-white flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> {t("auth.back_to_login")}
        </Link>
        <h1 className="text-2xl font-bold mb-1">{t("auth.register_title")}</h1>
        <p className="text-white/50 text-sm mb-6">{t("auth.register_subtitle")}</p>

        <form onSubmit={submit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm text-white/60 mb-1 flex items-center gap-2">
                <f.icon size={14} /> {f.label}
              </label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={(e) => handle(f.key, e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-sky-500/50 focus:outline-none transition-all"
                required
              />
            </div>
          ))}

          {error && <p className="text-rose-400 text-sm">{error}</p>}
          {success && <p className="text-emerald-400 text-sm">{success}</p>}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold disabled:opacity-50"
          >
            {loading ? t("auth.creating") : t("auth.register_btn")}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
