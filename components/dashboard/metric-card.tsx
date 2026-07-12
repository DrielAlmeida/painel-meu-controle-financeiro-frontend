import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
export function MetricCard({title,value,subtitle,icon:Icon}:{title:string;value:string;subtitle?:string;icon:LucideIcon}){return <Card><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p>{subtitle&&<p className="mt-1 text-xs text-slate-500">{subtitle}</p>}</div><div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950"><Icon size={20}/></div></div></Card>}
