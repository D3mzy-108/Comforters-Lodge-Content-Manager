import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Calendar, ImageIcon, Loader2, RefreshCw, Search } from "lucide-react";
import type { DailyDevotion } from "../../../utils/schemas";
import EmptyState from "../EmptyDataState";
import { formatDate } from "../../../utils/format_utils";
import { api } from "../../../utils/api/api_connection";
import DeleteButton from "../../DeleteButton";
import { DevotionDetailButton } from "../DetailsDialog";
import CreateDevotionDialog from "../forms/CreateDevotion";

export default function DevotionsPanel({
  devotions,
  loading,
  error,
  onReload,
  onCreated,
  onDeleted,
}: {
  devotions: DailyDevotion[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onCreated: () => void;
  onDeleted: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return devotions;
    return devotions.filter((d) => {
      return (
        d.citation.toLowerCase().includes(s) ||
        d.verse_content.toLowerCase().includes(s)
      );
    });
  }, [devotions, q]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Daily Devotions</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              Upload cover images and scripture text.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search citation or verse content…"
                className="pl-9 sm:w-[320px]"
              />
            </div>
            <CreateDevotionDialog onCreated={onCreated} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading devotions…
            </div>
          ) : error ? (
            <EmptyState
              title="Could not load devotions"
              subtitle={error}
              action={
                <Button
                  onClick={onReload}
                  variant="outline"
                  className="gap-2 primary-btn"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No devotions found"
              subtitle={
                q
                  ? "Try a different search."
                  : "Create your first Daily Devotion."
              }
              action={<CreateDevotionDialog onCreated={onCreated} />}
            />
          ) : (
            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-30">Date</TableHead>
                    <TableHead className="border-x">Scripture</TableHead>
                    <TableHead className="w-30">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm text-muted-foreground px-8">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />{" "}
                          {formatDate(d.date_posted)}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 border-x">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border bg-background">
                            {/* {d.cover_image_url ? (
                              // eslint-disable-next-line next/next/no-img-element
                              <img
                                src={d.cover_image_url}
                                alt="cover"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                            )} */}
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{d.citation}</div>
                            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {d.verse_content}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex items-center justify-end gap-2">
                          <DevotionDetailButton id={d.id} />
                          <DeleteButton
                            label="Delete"
                            onConfirm={async () => {
                              await api(`/devotions/${d.id}`, {
                                method: "DELETE",
                              });
                              onDeleted();
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Tip:</div>
            <Button
              variant="ghost"
              className="gap-2 outline-btn"
              onClick={onReload}
            >
              <RefreshCw className="h-4 w-4" /> Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
