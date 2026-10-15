import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, X, Clock } from "lucide-react";
import api from "../lib/api";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../stores/auth";

export default function Attendance() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role === "teacher" || user?.role === "owner";
  const [items, setItems] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    enrollment_id: 0,
    date: new Date().toISOString().slice(0, 10),
    status: "present",
  });

  const load = () => {
    Promise.all([api.get("/attendance"), api.get("/enrollments")]).then(([a, e]) => {
      setItems(a.data);
      setEnrollments(e.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/attendance", { ...form, enrollment_id: +form.enrollment_id });
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  const statusIcon = (s: string) => {
    if (s === "present") return <Check className="text-emerald-400" size={18} />;
    if (s === "late") return <Clock className="text-amber-400" size={18} />;
    return <X className="text-rose-400" size={18} />;
  };

  const statusLabel = (s: string) => {
    if (s === "present") return "{t("attendance.present")}";
    if (s === "late") return "{t("attendance.late")}";
    return "{t("attendance.absent")}";
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("attendance.title")}</h1>
          {canEdit && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Plus size={16} /> {t("attendance.add")}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass rounded-2xl p-5">
              <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-white/50">{t("attendance.student_course")}</label>
                  <select value={form.enrollment_id} onChange={(e) => setForm({ ...form, enrollment_id: +e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1 min-w-[200px]" required>
                    <option value={0}>{t("common.select")}</option>
                    {enrollments.map((en) => (
                      <option key={en.id} value={en.id}>{en.student_name} — {en.course_title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("attendance.date")}</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("attendance.status")}</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1">
                    <option value="present">{t("attendance.present")}</option>
                    <option value="late">{t("attendance.late")}</option>
                    <option value="absent">{t("attendance.absent")}</option>
                  </select>
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-sky-500 text-white font-medium">{t("common.save")}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/10">{t("common.cancel")}</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <p className="text-white/40">{t("common.loading")}</p>}

        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-sm text-white/50">
                <th className="py-3 px-4">{t("attendance.date")}</th>
                <th className="py-3 px-4">{t("attendance.student")}</th>
                <th className="py-3 px-4">{t("attendance.course")}</th>
                <th className="py-3 px-4">{t("attendance.status")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-sm">{new Date(a.date).toLocaleDateString("ru-RU")}</td>
                  <td className="py-3 px-4 font-medium">{a.student_name || "—"}</td>
                  <td className="py-3 px-4 text-sm text-white/70">{a.course_title}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-2">
                      {statusIcon(a.status)} {statusLabel(a.status)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && <p className="text-center text-white/40 py-12">{t("attendance.empty")}</p>}
        </div>
      </div>
    </PageTransition>
  );
}
