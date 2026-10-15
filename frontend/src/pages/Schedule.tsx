import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import api from "../lib/api";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../stores/auth";

interface ScheduleItem {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  group_name: string;
  course_title: string;
  group_id: number;
}

export default function Schedule() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === "owner";
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    group_id: 0, day_of_week: 0, start_time: "16:00", end_time: "17:30", room: "",
  });
  const days = t("schedule.days", { returnObjects: true }) as string[];

  const load = () => {
    Promise.all([api.get("/schedules"), api.get("/groups")]).then(([s, g]) => {
      setItems(s.data);
      setGroups(g.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/schedules", {
        ...form,
        group_id: +form.group_id,
        day_of_week: +form.day_of_week,
        start_time: form.start_time + ":00",
        end_time: form.end_time + ":00",
      });
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  const remove = async (id: number) => {
    if (!confirm(t("schedule.confirm_delete"))) return;
    await api.delete(`/schedules/${id}`);
    load();
  };

  const byDay = days.map((dayName, idx) => ({
    name: dayName,
    items: items.filter((s) => s.day_of_week === idx),
  }));

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("schedule.title")}</h1>
          {isOwner && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Plus size={16} /> {t("schedule.add")}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass rounded-2xl p-5">
              <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-white/50">{t("schedule.group")}</label>
                  <select value={form.group_id} onChange={(e) => setForm({ ...form, group_id: +e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required>
                    <option value={0}>{t("common.select")}</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.course_title})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("schedule.day")}</label>
                  <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: +e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1">
                    {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("schedule.start")}</label>
                  <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("schedule.end")}</label>
                  <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" required />
                </div>
                <div>
                  <label className="text-xs text-white/50">{t("schedule.room")}</label>
                  <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="block px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-1" />
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-sky-500 text-white font-medium">{t("common.save")}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/10">{t("common.cancel")}</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <p className="text-white/40">{t("common.loading")}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {byDay.map((day, di) => (
            <motion.div key={day.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: di * 0.07 }} className="glass rounded-2xl p-4">
              <h3 className="font-semibold text-sky-300 mb-3">{day.name}</h3>
              {day.items.length === 0 && <p className="text-white/30 text-sm">—</p>}
              <div className="space-y-2">
                {day.items.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }} whileHover={{ scale: 1.03 }}
                    className="rounded-xl bg-white/5 border border-white/10 p-3 hover:border-sky-500/30 transition-colors relative group">
                    <p className="font-medium text-sm">{s.course_title}</p>
                    <p className="text-xs text-white/50">{s.group_name}</p>
                    <p className="text-xs text-sky-400 mt-1">
                      {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                      {s.room && ` · ${s.room}`}
                    </p>
                    {isOwner && (
                      <button onClick={() => remove(s.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
