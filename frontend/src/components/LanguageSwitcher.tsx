import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: "ru" | "uz") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-md">
      {(["ru", "uz"] as const).map((lng) => (
        <motion.button
          key={lng}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => changeLanguage(lng)}
          className={`
            rounded-full px-3 py-1.5 text-sm font-medium transition-colors
            ${i18n.language?.startsWith(lng)
              ? "bg-white text-slate-900 shadow"
              : "text-white/70 hover:text-white"}
          `}
        >
          {lng.toUpperCase()}
        </motion.button>
      ))}
    </div>
  );
}
