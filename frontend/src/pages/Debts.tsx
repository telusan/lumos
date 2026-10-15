import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, CreditCard } from "lucide-react";
import api from "../lib/api";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../stores/auth";

interface Invoice {
  id: number;
  student_name: string;
  amount: number;
  due_date: string;
  status: "pending" | "overdue" | "paid";
  description: string;
}

const statusConfig = {
  pending: { color: "from-amber-400/20 to-orange-500/10", border: "border-amber-400/40", icon: Clock, text: "text-amber-400" },
  overdue: { color: "from-rose-500/30 to-red-600/20", border: "border-rose-500/50", icon: AlertCircle, text: "text-rose-400" },
  paid: { color: "from-emerald-400/20 to-teal-500/10", border: "border-emerald-400/40", icon: CheckCircle2, text: "text-emerald-400" },
};

export default function Debts() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === "owner";
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/invoices").then((res) => {
      setInvoices(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const pay = async (id: number) => {
    if (!confirm(t("common.confirm_pay"))) return;
    await api.post(`/invoices/${id}/pay`);
    load();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("debts.title")}</h1>
        {loading && <p className="text-white/40">{t("common.loading")}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((inv, index) => {
            const config = statusConfig[inv.status] || statusConfig.pending;
            const Icon = config.icon;
            return (
              <motion.div key={inv.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.06 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-gradient-to-br ${config.color} ${config.border} p-5`}>
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/60">{inv.description}</p>
                    <h3 className="mt-1 text-lg font-semibold">{inv.student_name || "—"}</h3>
                    <p className="mt-2 text-2xl font-bold tabular-nums">
                      {Number(inv.amount).toLocaleString("ru-RU")} so'm
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {t("debts.due_date")}: {new Date(inv.due_date).toLocaleDateString("ru-RU")}
                    </p>
                    <p className={`mt-2 text-sm font-medium ${config.text}`}>
                      {t(`debts.status_${inv.status}`)}
                    </p>
                    {isOwner && inv.status !== "paid" && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => pay(inv.id)}
                        className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm border border-emerald-500/30">
                        <CreditCard size={14} /> {t("debts.pay")}
                      </motion.button>
                    )}
                  </div>
                  <Icon className={`h-8 w-8 ${config.text}`} />
                </div>
                {inv.status === "overdue" && (
                  <motion.div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-rose-500"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }} />
                )}
              </motion.div>
            );
          })}
        </div>
        {!loading && invoices.length === 0 && <p className="text-white/40 text-center py-12">—</p>}
      </div>
    </PageTransition>
  );
}
