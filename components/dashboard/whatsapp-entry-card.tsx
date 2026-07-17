import { useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DEFAULT_WHATSAPP_NUMBER = "5527998967373";
const onlyDigits = (value: string) => value.replace(/\D/g, "");

function formatBrazilianPhone(value: string) {
  const digits = onlyDigits(value).replace(/^55/, "").slice(0, 11);
  return digits.length === 11 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` : value;
}

export function WhatsAppEntryCard() {
  const number = onlyDigits(import.meta.env.VITE_WHATSAPP_ENTRY_NUMBER || DEFAULT_WHATSAPP_NUMBER);
  const formattedNumber = formatBrazilianPhone(number);
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(formattedNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { window.prompt("Copie o número abaixo:", formattedNumber); }
  }

  return <Card className="border-emerald-300 bg-gradient-to-r from-emerald-50 to-white dark:border-emerald-700/70 dark:from-emerald-950/40 dark:to-[#0d2b4d]">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white"><MessageCircle size={24}/></div><div><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Envio de gastos pelo WhatsApp</p><h2 className="mt-1 text-lg font-black">Este é seu número para envio de mensagens</h2><p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{formattedNumber}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Envie seus gastos por texto ou áudio. Depois do processamento, eles aparecerão automaticamente no painel.</p></div></div>
      <div className="flex shrink-0 flex-wrap gap-2"><Button type="button" variant="secondary" onClick={() => void copyNumber()}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?"Copiado":"Copiar número"}</Button><a className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-medium text-white transition hover:bg-emerald-500" href={`https://wa.me/${number}`} target="_blank" rel="noreferrer"><ExternalLink size={17}/>Abrir WhatsApp</a></div>
    </div>
  </Card>;
}
