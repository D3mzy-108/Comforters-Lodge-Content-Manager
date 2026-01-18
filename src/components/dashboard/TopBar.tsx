import { cn } from "../../utils/format_utils";
import { BookOpen, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { API_BASE } from "../../utils/api/base";
import type { DashboardDisplayMode } from "../../utils/schemas";

export default function TopBar({
  active,
  onRefresh,
  refreshing,
}: {
  active: DashboardDisplayMode;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-background shadow-sm">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl font-semibold tracking-tight">
            Comforters Lodge
          </div>
          <div className="text-sm text-muted-foreground">
            Admin dashboard · manage Daily Posts & Devotions
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="hidden sm:inline-flex">
          API: {API_BASE}
        </Badge>
        <Button
          variant="default"
          onClick={onRefresh}
          disabled={refreshing}
          className="gap-2 outline-btn"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
        <Badge
          className={cn(
            "rounded-full capitalize",
            active === "posts"
              ? "bg-primary text-primary-foreground"
              : active === "hymns"
              ? "bg-gray-600 text-gray-100"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {active}
        </Badge>
      </div>
    </div>
  );
}
