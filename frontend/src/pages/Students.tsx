import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { User, Plus, Trash2, UserPlus } from "lucide-react";
import api from "../lib/api";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../stores/auth";

interface Student {
  id: number;
  full_name: string;
  email: string;
}

export default function Students() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === "owner";
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "student123" });
  const [groups, setGroups] = useState<any[]>([]);
  const [enrollForm, setEnrollForm] = useState({ student_id: 0, group_id: 0 });
  const [showEnroll, setShowEnroll] = useState(false);

  const load = () => {
    api.get("/students").then((res) => {
      setStudents(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get("/groups").then((r) => setGroups(r.data)).catch(() => {});
  }, []);

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/students", form);
      setShowForm(false);
      setForm({ full_name: "", email: "", password: "student123" });
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  const removeStudent = async (id: number) => {
    if (!confirm(t("students.confirm_expel"))) return;
    await api.delete(`/students/${id}`);
    load();
  };

  const enroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/enrollments", enrollForm);
      setShowEnroll(false);
      alert(t("students.enrolled"));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold">{t("students.title")}</h1>
          {isOwner && (
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowEnroll(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                <UserPlus size={16} /> {t("students.enroll")}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <Plus size={16} /> {t("students.add")}
              </motion.button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass rounded-2xl p-5">
              <form onSubmit={addStudent} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-white/50">{t("students.name")}</label>
                  <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-white/50">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("students.password")}</label>
                  <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" />
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-sky-500 text-white font-medium">{t("common.save")}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/10">{t("common.cancel")}</button>
              </form>
            </motion.div>
          )}
          {showEnroll && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass rounded-2xl p-5">
              <form onSubmit={enroll} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-white/50">Ученик</label>
                  <select value={enrollForm.student_id} onChange={(e) => setEnrollForm({ ...enrollForm, student_id: +e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required>
                    <option value={0}>{t("common.select")}</option>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("schedule.group")}</label>
                  <select value={enrollForm.group_id} onChange={(e) => setEnrollForm({ ...enrollForm, group_id: +e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required>
                    <option value={0}>{t("common.select")}</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.course_title})</option>)}
                  </select>
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-violet-500 text-white font-medium">{t("students.enroll")}</button>
                <button type="button" onClick={() => setShowEnroll(false)} className="px-4 py-2 rounded-lg bg-white/10">{t("common.cancel")}</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <p className="text-white/40">{t("common.loading")}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-sky-500/20 flex items-center justify-center">
                <User className="text-sky-400" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{s.full_name}</p>
                <p className="text-sm text-white/50 truncate">{s.email}</p>
              </div>
              {isOwner && (
                <button onClick={() => removeStudent(s.id)} className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
