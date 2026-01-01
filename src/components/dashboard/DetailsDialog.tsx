"use client";
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { api } from "../../utils/api/api_connection";
import type { DailyDevotion, DailyPost } from "../../utils/schemas";
import { Calendar, ChevronRight, ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import EmptyState from "./EmptyDataState";
import { Badge } from "../ui/badge";
import { formatDate } from "../../utils/format_utils";
import { Separator } from "../ui/separator";

function DetailDialog({
  title,
  description,
  trigger,
  children,
}: {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl border-0 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">{children}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="whitespace-pre-wrap text-base leading-relaxed">
        {value || <span className="text-muted-foreground">(empty)</span>}
      </div>
    </div>
  );
}

export function PostDetailButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyPost | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <DetailDialog
      title={`Daily Post #${id}`}
      description="Full content preview"
      trigger={
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl primary-btn"
          onClick={async () => {
            setLoading(true);
            setErr(null);
            try {
              const p = await api<DailyPost>(`/posts/${id}`);
              setData(p);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              setErr(error?.message || "Failed to load");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      }
    >
      {err ? (
        <EmptyState title="Could not load post" subtitle={err} />
      ) : !data ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-2">
              <Calendar className="h-3.5 w-3.5" />{" "}
              {formatDate(data.date_posted)}
            </Badge>
          </div>
          <Separator />
          <Field label="Series Title" value={data.series_title} />
          <Field label="Opening Hook" value={data.opening_hook} />
          <Field label="Theme" value={data.theme} />
          <Field label="Personal Question" value={data.personal_question} />
          <Field label="Biblical Question & Answer" value={data.biblical_qa} />
          <Field label="Reflection" value={data.reflection} />
          <Field label="Story" value={data.story} />
          <Field label="Prayer" value={data.prayer} />
          <Field label="Activity Guide" value={data.activity_guide} />
        </div>
      )}
    </DetailDialog>
  );
}

export function DevotionDetailButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyDevotion | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <DetailDialog
      title={`Daily Devotion #${id}`}
      description="Full content preview"
      trigger={
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl primary-btn"
          onClick={async () => {
            setLoading(true);
            setErr(null);
            try {
              const d = await api<DailyDevotion>(`/devotions/${id}`);
              setData(d);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
              setErr(e?.message || "Failed to load");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      }
    >
      {err ? (
        <EmptyState title="Could not load devotion" subtitle={err} />
      ) : !data ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border bg-background">
              {/* {data.cover_image_url ? (
                <img
                  src={data.cover_image_url}
                  alt="cover"
                  className="h-full w-full object-cover"
                />
              ) : (
            )} */}
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg font-semibold">{data.citation}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatDate(data.date_posted)}
              </div>
            </div>
          </div>
          <Separator />
          <Field label="Verse Content" value={data.verse_content} />
        </div>
      )}
    </DetailDialog>
  );
}
