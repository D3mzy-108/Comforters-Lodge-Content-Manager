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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { FileUpIcon, FolderIcon, Loader2, PlusIcon } from "lucide-react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { api } from "../../../utils/api/api_connection";
import type { DailyDevotion, UploadMode } from "../../../utils/schemas";

export default function CreateDevotionDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { show, node } = useToastLike();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<UploadMode>("single");

  // SINGLE FIELDS
  const [citation, setCitation] = useState("");
  const [verseContent, setVerseContent] = useState("");
  const [datePosted, setDatePosted] = useState("");
  // const [image, setImage] = useState<File | null>(null);

  // TSV
  const [tsv, setTsv] = useState<File | null>(null);

  const reset = () => {
    setCitation("");
    setVerseContent("");
    setDatePosted("");
    // setImage(null);
  };

  const submit = async () => {
    setBusy(true);
    try {
      const fd = new FormData();

      if (mode === "tsv") {
        if (!tsv) throw new Error("Please choose a TSV file.");
        fd.append("tsv_file", tsv);
      } else {
        // if (!image) throw new Error("Please choose a cover image.");
        if (!citation.trim()) throw new Error("Citation is required.");
        if (!verseContent.trim()) throw new Error("Verse content is required.");

        // fd.append("cover_image", image);
        fd.append("citation", citation);
        fd.append("verse_content", verseContent);
        if (datePosted.trim()) fd.append("date_posted", datePosted.trim());
      }

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

          <Tabs value={mode} onValueChange={(v) => setMode(v as UploadMode)}>
            <TabsList className="grid w-full grid-cols-2 pb-12">
              <TabsTrigger className="tab-style" value="single">
                Single
              </TabsTrigger>
              <TabsTrigger className="tab-style gap-2" value="tsv">
                <FileUpIcon className="h-4 w-4" /> Bulk TSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-4 space-y-4">
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
            </TabsContent>

            <TabsContent value="tsv" className="mt-4 space-y-4">
              <div className="scroll-style">
                <p className="text-black text-base">
                  The first row of your file should always contain these
                  headers. <br />
                  <span className="font-semibold text-red-700">
                    *DO NOT modify the values or order of the headers*
                  </span>
                </p>
                <div className="w-full mt-3 border-2 border-black/30 rounded-2xl p-4">
                  <div className="text-sm font-medium text-muted-foreground italic">
                    TSV header required
                  </div>
                  <div className="mt-1.5 text-base">
                    citation, verse_content, date_posted
                  </div>
                </div>
                <div className="mt-0.75 text-sm text-muted-foreground">
                  Date should be YYYY-MM-DD per row.
                </div>

                <div className="space-y-2 my-8">
                  <Label>Upload TSV File</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".tsv,text/tab-separated-values"
                      className="h-17.5 pt-8 px-4"
                      onChange={(e) => setTsv(e.target.files?.[0] || null)}
                    />
                    <FolderIcon className="absolute w-5 top-3 left-4" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
