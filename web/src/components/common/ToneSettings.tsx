import { useLocale } from "@/hooks/useLocale"
import type { ToneSettings as ToneSettingsType } from "shared/constants"
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
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.button}
            data-active={value.translationStyle === "paraphrase"}
            onClick={() => onChange({ ...value, translationStyle: "paraphrase" })}
          >
            {t("tone.paraphrase")}
          </button>
          <button
            type="button"
            className={styles.button}
            data-active={value.translationStyle === "literal"}
            onClick={() => onChange({ ...value, translationStyle: "literal" })}
          >
            {t("tone.literal")}
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>{t("tone.formality")}</span>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.button}
            data-active={value.formality === "casual"}
            onClick={() => onChange({ ...value, formality: "casual" })}
          >
            {t("tone.casual")}
          </button>
          <button
            type="button"
            className={styles.button}
            data-active={value.formality === "formal"}
            onClick={() => onChange({ ...value, formality: "formal" })}
          >
            {t("tone.formal")}
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>{t("tone.domain")}</span>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.button}
            data-active={value.domain === "technical"}
            onClick={() => onChange({ ...value, domain: "technical" })}
          >
            {t("tone.technical")}
          </button>
          <button
            type="button"
            className={styles.button}
            data-active={value.domain === "general"}
            onClick={() => onChange({ ...value, domain: "general" })}
          >
            {t("tone.general")}
          </button>
        </div>
      </div>
    </div>
  )
}
