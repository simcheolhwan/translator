import { useState, useCallback } from "react"
import { Copy, Check } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"
import clsx from "clsx"
import styles from "./CopyButton.module.css"

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const { t } = useLocale()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      className={clsx(styles.button, copied && styles.copied, className)}
      onClick={handleCopy}
      aria-label={t("chat.copy")}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      <span>{copied ? t("chat.copied") : t("chat.copy")}</span>
    </button>
  )
}
