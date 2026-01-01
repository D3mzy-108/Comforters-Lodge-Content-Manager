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
import { Calendar, Loader2, RefreshCw, Search } from "lucide-react";
import type { DailyPost } from "../../../utils/schemas";
import EmptyState from "../EmptyDataState";
import { formatDate } from "../../../utils/format_utils";
import { api } from "../../../utils/api/api_connection";
import DeleteButton from "../../DeleteButton";
import { PostDetailButton } from "../DetailsDialog";
import CreatePostDialog from "../forms/CreatePost";

export default function PostsPanel({
  posts,
  loading,
  error,
  onReload,
  onCreated,
  onDeleted,
}: {
  posts: DailyPost[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onCreated: () => void;
  onDeleted: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    console.log(posts);
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => {
      return (
        p.opening_hook.toLowerCase().includes(s) ||
        p.personal_question.toLowerCase().includes(s) ||
        p.biblical_qa.toLowerCase().includes(s) ||
        p.reflection.toLowerCase().includes(s)
      );
    });
  }, [posts, q]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Daily Posts</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              Create, browse, and delete lesson posts.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search opening hook, reflection…"
                className="pl-9 sm:w-[320px]"
              />
            </div>
            <CreatePostDialog onCreated={onCreated} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading posts…
            </div>
          ) : error ? (
            <EmptyState
              title="Could not load posts"
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
              title="No posts found"
              subtitle={
                q ? "Try a different search." : "Create your first Daily Post."
              }
              action={<CreatePostDialog onCreated={onCreated} />}
            />
          ) : (
            <div className="rounded-2xl border text-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-30">Date</TableHead>
                    <TableHead className="border-x">Opening Hook</TableHead>
                    <TableHead className="w-30">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm text-muted-foreground px-8">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />{" "}
                          {formatDate(p.date_posted)}
                        </div>
                      </TableCell>
                      <TableCell className="border-x px-8">
                        <div className="font-medium line-clamp-2">
                          {p.personal_question}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {p.series_title}
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex items-center justify-end gap-2">
                          <PostDetailButton id={p.id} />
                          <DeleteButton
                            label={`Delete ${p.opening_hook}`}
                            onConfirm={async () => {
                              await api(`/posts/${p.id}`, { method: "DELETE" });
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
            <div className="text-sm text-muted-foreground">
              Tip: bulk upload with TSV using the same “Create Post” button.
            </div>
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
