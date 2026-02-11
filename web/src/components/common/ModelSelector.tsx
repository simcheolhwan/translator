import { useLocale } from "@/hooks/useLocale"
import { MODELS, type Model } from "functions/constants"
import styles from "./ModelSelector.module.css"

interface ModelSelectorProps {
  value: Model
  onChange: (model: Model) => void
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { t } = useLocale()

  return (
    <div className={styles.container}>
      <label className={styles.label}>{t("model.select")}</label>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as Model)}
      >
        {MODELS.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  )
}
