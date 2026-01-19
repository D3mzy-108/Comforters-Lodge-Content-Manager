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
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MusicIcon,
  RefreshCw,
  Search,
} from "lucide-react";
import type { Hymn, PagePaginator } from "../../../utils/schemas";
import EmptyState from "../EmptyDataState";
import { api } from "../../../utils/api/api_connection";
import DeleteButton from "../../DeleteButton";
import { HymnDetailsButton } from "../DetailsDialog";
import HymnFormDialog from "../forms/hymns/HymnForm";

export default function HymnsPanel({
  hymns,
  loading,
  error,
  onReload,
  onCreated,
  onDeleted,
  pagePaginator,
  onPageChange,
  isLastPage,
}: {
  hymns: Hymn[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onCreated: () => void;
  onDeleted: () => void;
  pagePaginator: PagePaginator;
  onPageChange: (page: number) => void;
  isLastPage: boolean;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return hymns;
    return hymns.filter((h) => {
      return (
        h.hymn_number.toString().toLowerCase().includes(s) ||
        h.hymn_title.toLowerCase().includes(s) ||
        h.classification.toLowerCase().includes(s) ||
        h.tune_ref.toLowerCase().includes(s) ||
        h.cross_ref.toLowerCase().includes(s) ||
        h.scripture.toLowerCase().includes(s) ||
        h.chorus_title.toLowerCase().includes(s) ||
        h.chorus.toLowerCase().includes(s) ||
        h.verses.join("---").toLowerCase().includes(s)
      );
    });
  }, [hymns, q]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Daily Hymns</CardTitle>
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
            <HymnFormDialog
              hymnData={undefined}
              onCreated={onCreated}
              children={undefined}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading hymns…
            </div>
          ) : error ? (
            <EmptyState
              title="Could not load hymns"
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
              title="No hymns found"
              subtitle={
                q ? "Try a different search." : "Create your first Daily Hymn."
              }
              action={
                <HymnFormDialog
                  hymnData={undefined}
                  onCreated={onCreated}
                  children={undefined}
                />
              }
            />
          ) : (
            <div className="rounded-2xl border text-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-30">Hymn No #</TableHead>
                    <TableHead className="border-x">Hymn Title</TableHead>
                    <TableHead className="w-30">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-sm text-muted-foreground px-8">
                        <div className="flex items-center gap-2">
                          # {h.hymn_number}
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
                            <MusicIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{h.hymn_title}</div>
                            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {h.scripture}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex items-center justify-end gap-2">
                          <HymnDetailsButton id={h.id} />
                          <DeleteButton
                            label="Delete"
                            onConfirm={async () => {
                              await api(`/hymns/${h.id}`, {
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

          <div className="w-full flex justify-center gap-4 items-center mt-8">
            <Button
              variant={"default"}
              size={"lg"}
              className="px-4 py-6 outline-btn"
              onClick={() => onPageChange(pagePaginator.page - 1)}
              disabled={pagePaginator.page === 1}
            >
              <ChevronLeft />
            </Button>
            <span className="text-lg">{pagePaginator.progress}</span>
            <Button
              variant={"default"}
              size={"lg"}
              className="px-4 py-6 outline-btn"
              onClick={() => onPageChange(pagePaginator.page + 1)}
              disabled={isLastPage}
            >
              <ChevronRight />
            </Button>
          </div>
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
