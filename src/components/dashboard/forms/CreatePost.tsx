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
import { FileUpIcon, FolderIcon, Loader2, PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { api } from "../../../utils/api/api_connection";
import type { DailyPost } from "../../../utils/schemas";

type Mode = "single" | "tsv";

export default function CreatePostDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { show, node } = useToastLike();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("single");
  const [busy, setBusy] = useState(false);

  // Single fields
  const [openingHook, setOpeningHook] = useState("");
  const [personalQuestion, setPersonalQuestion] = useState("");
  const [biblicalQA, setBiblicalQA] = useState("");
  const [reflection, setReflection] = useState("");
  const [story, setStory] = useState("");
  const [prayer, setPrayer] = useState("");
  const [activityGuide, setActivityGuide] = useState("");
  const [datePosted, setDatePosted] = useState("");

  // TSV
  const [tsv, setTsv] = useState<File | null>(null);

  const reset = () => {
    setOpeningHook("");
    setPersonalQuestion("");
    setBiblicalQA("");
    setReflection("");
    setStory("");
    setPrayer("");
    setActivityGuide("");
    setDatePosted("");
    setTsv(null);
    setMode("single");
  };

  const submit = async () => {
    setBusy(true);
    try {
      const fd = new FormData();

      if (mode === "tsv") {
        if (!tsv) throw new Error("Please choose a TSV file.");
        fd.append("tsv_file", tsv);
      } else {
        // Append fields for single create
        fd.append("opening_hook", openingHook);
        fd.append("personal_question", personalQuestion);
        fd.append("biblical_qa", biblicalQA);
        fd.append("reflection", reflection);
        fd.append("story", story);
        fd.append("prayer", prayer);
        fd.append("activity_guide", activityGuide);
        if (datePosted.trim()) fd.append("date_posted", datePosted.trim());
      }

      await api<DailyPost[]>("/posts", {
        method: "POST",
        body: fd,
      });

      show(mode === "tsv" ? "Bulk posts uploaded." : "Post created.");
      onCreated();
      setOpen(false);
      reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      show(e?.message || "Failed to create post");
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
          <Button className="gap-2 rounded-2xl primary-btn">
            <PlusIcon className="h-4 w-4" /> Create Post
          </Button>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl w-full border-0 rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle>Create Daily Post</DialogTitle>
            <DialogDescription>
              Add a single post via form, or upload a TSV for bulk creation.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
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
                    <Label>Opening Hook</Label>
                    <Input
                      value={openingHook}
                      onChange={(e) => setOpeningHook(e.target.value)}
                      placeholder="Arresting one-liner…"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Personal Question</Label>
                    <Textarea
                      value={personalQuestion}
                      onChange={(e) => setPersonalQuestion(e.target.value)}
                      placeholder="Piercing self-examination…"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Biblical Question & Answer</Label>
                    <Textarea
                      value={biblicalQA}
                      onChange={(e) => setBiblicalQA(e.target.value)}
                      placeholder="Jesus’ actual encounter…"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Reflection</Label>
                    <Textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Theological unpacking…"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Story</Label>
                    <Textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      placeholder="Contextualized testimony…"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Prayer</Label>
                    <Textarea
                      value={prayer}
                      onChange={(e) => setPrayer(e.target.value)}
                      placeholder="Personal, honest, actionable…"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Activity Guide</Label>
                    <Textarea
                      value={activityGuide}
                      onChange={(e) => setActivityGuide(e.target.value)}
                      placeholder="One concrete step…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Posted (optional)</Label>
                    <Input
                      value={datePosted}
                      onChange={(e) => setDatePosted(e.target.value)}
                      placeholder="YYYY-MM-DD"
                    />
                    <div className="text-xs text-muted-foreground">
                      If omitted, the server will default to today.
                    </div>
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
                    opening_hook, personal_question, biblical_qa, reflection,
                    story, prayer, activity_guide, date_posted
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
              disabled={busy}
              className="outline-btn"
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
