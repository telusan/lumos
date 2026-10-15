import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import api from "../lib/api";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../stores/auth";

interface Grade {
  id: number;
  date: string;
  value: string;
  comment: string;
  student_name: string;
  course_title: string;
  enrollment_id: number;
}

export default function Grades() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role === "teacher" || user?.role === "owner";
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ enrollment_id: 0, date: new Date().toISOString().slice(0, 10), value: "5", comment: "" });

  const load = () => {
    Promise.all([api.get("/grades"), api.get("/enrollments")]).then(([g, e]) => {
      setGrades(g.data);
      setEnrollments(e.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/grades", { ...form, enrollment_id: +form.enrollment_id });
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  const gradeColor = (v: string) => {
    if (v === "5") return "bg-emerald-500/20 text-emerald-400";
    if (v === "4") return "bg-sky-500/20 text-sky-400";
    if (v === "3") return "bg-amber-500/20 text-amber-400";
    return "bg-rose-500/20 text-rose-400";
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("grades.title")}</h1>
          {canEdit && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Plus size={16} /> {t("grades.add")}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass rounded-2xl p-5">
              <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-white/50">{t("grades.student_course")}</label>
                  <select value={form.enrollment_id} onChange={(e) => setForm({ ...form, enrollment_id: +e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1 min-w-[200px]" required>
                    <option value={0}>{t("common.select")}</option>
                    {enrollments.map((en) => (
                      <option key={en.id} value={en.id}>{en.student_name} — {en.course_title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("grades.date")}</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("grades.grade")}</label>
                  <select value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1">
                    {["5", "4", "3", "2"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("grades.comment")}</label>
                  <input value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" />
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
                <th className="py-3 px-4">{t("grades.date")}</th>
                <th className="py-3 px-4">{t("grades.student")}</th>
                <th className="py-3 px-4">{t("grades.course")}</th>
                <th className="py-3 px-4">{t("grades.grade")}</th>
                <th className="py-3 px-4">{t("grades.comment")}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {grades.map((g, i) => (
                  <motion.tr key={g.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm">{new Date(g.date).toLocaleDateString("ru-RU")}</td>
                    <td className="py-3 px-4 font-medium">{g.student_name || "—"}</td>
                    <td className="py-3 px-4 text-sm text-white/70">{g.course_title}</td>
                    <td className="py-3 px-4">
                      <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold ${gradeColor(g.value)}`}>
                        {g.value}
                      </motion.span>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/50 max-w-xs truncate">{g.comment}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {!loading && grades.length === 0 && <p className="text-center text-white/40 py-12">—</p>}
        </div>
      </div>
    </PageTransition>
  );
}
