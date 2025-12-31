import { Card, CardContent } from "../ui/card";
import { AlertCircle } from "lucide-react";

export default function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border bg-background">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
