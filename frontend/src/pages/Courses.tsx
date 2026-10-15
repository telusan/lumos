import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import api from "../lib/api";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../stores/auth";

interface Course {
  id: number;
  title: string;
  description: string;
  price_per_month: number;
}

export default function Courses() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === "owner";
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price_per_month: 400000 });

  const load = () => {
    api.get("/courses").then((res) => {
      setCourses(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/courses", form);
      setShowForm(false);
      setForm({ title: "", description: "", price_per_month: 400000 });
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  const remove = async (id: number) => {
    if (!confirm(t("courses.confirm_delete"))) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("courses.title")}</h1>
          {isOwner && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Plus size={16} /> {t("courses.add")}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass rounded-2xl p-5">
              <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-white/50">{t("courses.name")}</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("courses.description")}</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("courses.price")}</label>
                  <input type="number" value={form.price_per_month}
                    onChange={(e) => setForm({ ...form, price_per_month: +e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required />
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-sky-500 text-white font-medium">{t("common.save")}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/10">{t("common.cancel")}</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <p className="text-white/40">{t("common.loading")}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, type: "spring" }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="glass rounded-2xl p-6 border border-white/10 hover:border-violet-500/30 transition-colors relative group">
              <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                <GraduationCap className="text-violet-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="text-sm text-white/50 mt-1 line-clamp-2">{c.description}</p>
              <p className="mt-4 text-xl font-bold text-sky-300">
                {Number(c.price_per_month).toLocaleString("ru-RU")} so'm
              </p>
              {isOwner && (
                <button onClick={() => remove(c.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-all">
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
