import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed, XCircle, AlertCircle, Clock } from "lucide-react";

type Status = "pending" | "processing" | "completed" | "failed" | string;

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const normalizedStatus = status.toLowerCase();

  const config = {
    processing: {
      color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      icon: CircleDashed,
      animate: true,
      label: "Processing"
    },
    pending: {
      color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      icon: Clock,
      animate: false,
      label: "Pending"
    },
    completed: {
      color: "text-primary bg-primary/10 border-primary/20",
      icon: CheckCircle2,
      animate: false,
      label: "Completed"
    },
    failed: {
      color: "text-destructive bg-destructive/10 border-destructive/20",
      icon: XCircle,
      animate: false,
      label: "Failed"
    }
  };

  const style = config[normalizedStatus as keyof typeof config] || {
    color: "text-muted-foreground bg-muted/10 border-muted/20",
    icon: AlertCircle,
    animate: false
  };

  const Icon = style.icon;
  const label = (style as any).label || status;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
      style.color,
      className
    )}>
      <Icon size={12} className={cn(style.animate && "animate-spin")} />
      {label}
    </span>
  );
}
