"use client";
import { useState } from "react";
import { useToastLike } from "../../toastFeedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Loader2, PlusIcon } from "lucide-react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { api } from "../../../utils/api/api_connection";
import type { DailyDevotion } from "../../../utils/schemas";

export default function CreateDevotionDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { show, node } = useToastLike();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [citation, setCitation] = useState("");
  const [verseContent, setVerseContent] = useState("");
  const [datePosted, setDatePosted] = useState("");
  // const [image, setImage] = useState<File | null>(null);

  const reset = () => {
    setCitation("");
    setVerseContent("");
    setDatePosted("");
    // setImage(null);
  };

  const submit = async () => {
    setBusy(true);
    try {
      // if (!image) throw new Error("Please choose a cover image.");
      if (!citation.trim()) throw new Error("Citation is required.");
      if (!verseContent.trim()) throw new Error("Verse content is required.");

      const fd = new FormData();
      // fd.append("cover_image", image);
      fd.append("citation", citation);
      fd.append("verse_content", verseContent);
      if (datePosted.trim()) fd.append("date_posted", datePosted.trim());

      await api<DailyDevotion>("/devotions", {
        method: "POST",
        body: fd,
      });

      show("Devotion created.");
      onCreated();
      setOpen(false);
      reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      show(e?.message || "Failed to create devotion");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {node}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogTrigger asChild>
          <Button className="gap-2 rounded-2xl">
            <PlusIcon className="h-4 w-4" /> Create Devotion
          </Button>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl w-full border-0 rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle>Create Daily Devotion</DialogTitle>
            <DialogDescription>Add scripture content.</DialogDescription>
          </DialogHeader>

          <div className="scroll-style">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Citation / Bible Verse</Label>
                <Input
                  value={citation}
                  onChange={(e) => setCitation(e.target.value)}
                  placeholder="e.g., Psalm 23:1"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Verse Content</Label>
                <Textarea
                  value={verseContent}
                  onChange={(e) => setVerseContent(e.target.value)}
                  placeholder="The LORD is my shepherd…"
                />
              </div>

              <div className="space-y-2">
                <Label>Date Posted (optional)</Label>
                <Input
                  value={datePosted}
                  onChange={(e) => setDatePosted(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="outline-btn"
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={busy}
              className="gap-2 rounded-2xl primary-btn"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
