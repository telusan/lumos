import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, GraduationCap, AlertTriangle, BookOpen } from "lucide-react";
import api from "../lib/api";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../stores/auth";

export default function Dashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ students: 0, courses: 0, overdue: 0, grades: [] as any[] });

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, invoicesRes, gradesRes, studentsRes] = await Promise.all([
          api.get("/courses"),
          api.get("/invoices"),
          api.get("/grades"),
          user?.role !== "student" ? api.get("/students") : Promise.resolve({ data: [] }),
        ]);
        setStats({
          students: studentsRes.data.length,
          courses: coursesRes.data.length,
          overdue: invoicesRes.data.filter((i: any) => i.status === "overdue").length,
          grades: gradesRes.data.slice(0, 5),
        });
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [user]);

  const cards = [
    { icon: Users, label: t("dashboard.students_count"), value: stats.students, color: "from-sky-500/20 to-blue-600/10", border: "border-sky-500/30" },
    { icon: GraduationCap, label: t("dashboard.courses_count"), value: stats.courses, color: "from-violet-500/20 to-purple-600/10", border: "border-violet-500/30" },
    { icon: AlertTriangle, label: t("dashboard.overdue_count"), value: stats.overdue, color: "from-rose-500/20 to-red-600/10", border: "border-rose-500/30" },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-white/50 mt-1">
            {t("common.welcome")}, {user?.full_name}!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`glass rounded-2xl p-5 border ${card.border} bg-gradient-to-br ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className="text-white/40" size={32} />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-sky-400" />
            {t("dashboard.recent_grades")}
          </h2>
          <div className="space-y-3">
            {stats.grades.length === 0 && (
              <p className="text-white/40 text-sm">{t("common.loading")}</p>
            )}
            {stats.grades.map((g: any, i: number) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="font-medium">{g.student_name || "—"}</p>
                  <p className="text-sm text-white/50">{g.course_title}</p>
                </div>
                <span
                  className={`
                    inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold
                    ${g.value === "5" ? "bg-emerald-500/20 text-emerald-400" :
                      g.value === "4" ? "bg-sky-500/20 text-sky-400" :
                      "bg-amber-500/20 text-amber-400"}
                  `}
                >
                  {g.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
