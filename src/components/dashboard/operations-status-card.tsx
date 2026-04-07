import { Activity, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RuntimeCheck {
  label: string;
  ready: boolean;
}

export function OperationsStatusCard({ checks }: { checks: RuntimeCheck[] }) {
  const readyCount = checks.filter((check) => check.ready).length;

  return (
    <Card id="runtime-checks" className="scroll-mt-24 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          Runtime Checks
        </CardTitle>
        <CardDescription>
          Environment keys required by auth and the backend proxy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Readiness score</p>
            <p className="text-xs text-muted-foreground">
              {readyCount} of {checks.length} required keys detected
            </p>
          </div>
          <Badge
            variant={readyCount === checks.length ? "outline" : "secondary"}
          >
            <Activity />
            {readyCount === checks.length ? "Healthy" : "Review"}
          </Badge>
        </div>
        <div className="space-y-2">
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
            >
              <span className="text-sm text-foreground/80">{check.label}</span>
              <Badge variant={check.ready ? "outline" : "secondary"}>
                <span
                  className={check.ready ? "bg-emerald-500" : "bg-amber-500"}
                  aria-hidden="true"
                  style={{
                    width: "0.45rem",
                    height: "0.45rem",
                    borderRadius: "9999px",
                  }}
                />
                {check.ready ? "Ready" : "Missing"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
