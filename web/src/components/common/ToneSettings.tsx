import { useLocale } from "@/hooks/useLocale"
import type { ToneSettings as ToneSettingsType } from "@/lib/constants"
import clsx from "clsx"
import styles from "./ToneSettings.module.css"

interface ToneSettingsProps {
  value: ToneSettingsType
  onChange: (tone: ToneSettingsType) => void
}

export function ToneSettings({ value, onChange }: ToneSettingsProps) {
  const { t } = useLocale()

  return (
    <div className={styles.container}>
      <div className={styles.group}>
        <span className={styles.label}>{t("tone.style")}</span>
        <div className={styles.options}>
          <button
            type="button"
            className={clsx(
              styles.option,
              value.translationStyle === "paraphrase" && styles.optionActive,
            )}
            onClick={() => onChange({ ...value, translationStyle: "paraphrase" })}
          >
            {t("tone.paraphrase")}
          </button>
          <button
            type="button"
            className={clsx(
              styles.option,
              value.translationStyle === "literal" && styles.optionActive,
            )}
            onClick={() => onChange({ ...value, translationStyle: "literal" })}
          >
            {t("tone.literal")}
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>{t("tone.formality")}</span>
        <div className={styles.options}>
          <button
            type="button"
            className={clsx(styles.option, value.formality === "casual" && styles.optionActive)}
            onClick={() => onChange({ ...value, formality: "casual" })}
          >
            {t("tone.casual")}
          </button>
          <button
            type="button"
            className={clsx(styles.option, value.formality === "formal" && styles.optionActive)}
            onClick={() => onChange({ ...value, formality: "formal" })}
          >
            {t("tone.formal")}
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>{t("tone.domain")}</span>
        <div className={styles.options}>
          <button
            type="button"
            className={clsx(styles.option, value.domain === "general" && styles.optionActive)}
            onClick={() => onChange({ ...value, domain: "general" })}
          >
            {t("tone.general")}
          </button>
          <button
            type="button"
            className={clsx(styles.option, value.domain === "technical" && styles.optionActive)}
            onClick={() => onChange({ ...value, domain: "technical" })}
          >
            {t("tone.technical")}
          </button>
        </div>
      </div>
    </div>
  )
}
