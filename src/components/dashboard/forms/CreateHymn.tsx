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
import {
  FileUpIcon,
  FolderIcon,
  Loader2,
  PlusIcon,
  Music2Icon,
  CircleQuestionMarkIcon,
} from "lucide-react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { api } from "../../../utils/api/api_connection";
import type { UploadMode } from "../../../utils/schemas";

type Hymn = {
  id: number;
  hymn_number: number;
  hymn_title: string;
  classification: string;
  tune_ref: string;
  cross_ref: string;
  scripture: string;
  chorus_title: string;
  chorus: string;
  verses: string[];
};

const VERSE_TOOLTIP = `Tip: separate each verse with a blank line between them. 
E.g.:
    Verse 1: Line 1;
    Verse 1: Line 2;
    Verse 1: Line ...\n
    Verse 2: Line 1;
    Verse 2: Line 2;
    Verse 2: Line ...\n
    Verse 3: Line 1;
    Verse 3: Line 2;
    Verse 3: Line ...`;

export default function CreateHymnDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { show, node } = useToastLike();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<UploadMode>("single");

  // SINGLE FIELDS
  const [hymnNumber, setHymnNumber] = useState<string>("");
  const [hymnTitle, setHymnTitle] = useState("");
  const [classification, setClassification] = useState("");
  const [tuneRef, setTuneRef] = useState("");
  const [crossRef, setCrossRef] = useState("");
  const [scripture, setScripture] = useState("");
  const [chorusTitle, setChorusTitle] = useState("");
  const [chorus, setChorus] = useState("");

  // Verses UX: simple textarea that we split into an array
  // Tip: separate verses with a blank line.
  const [versesText, setVersesText] = useState("");

  // TSV
  const [tsv, setTsv] = useState<File | null>(null);

  const reset = () => {
    setHymnNumber("");
    setHymnTitle("");
    setClassification("");
    setTuneRef("");
    setCrossRef("");
    setScripture("");
    setChorusTitle("");
    setChorus("");
    setVersesText("");
    setTsv(null);
  };

  const parseVerses = (text: string): string[] => {
    // Split verses on blank lines; trim and remove empties
    return text
      .split(/\n\s*\n/g)
      .map((v) => v.trim())
      .filter(Boolean);
  };

  const submit = async () => {
    setBusy(true);
    try {
      const fd = new FormData();

      if (mode === "tsv") {
        if (!tsv) throw new Error("Please choose a TSV file.");
        fd.append("tsv_file", tsv);
      } else {
        // Validate required fields (tweak as your backend requires)
        if (!hymnNumber.trim()) throw new Error("Hymn number is required.");
        const parsedNumber = Number(hymnNumber);
        if (!Number.isFinite(parsedNumber) || parsedNumber <= 0) {
          throw new Error("Hymn number must be a valid positive number.");
        }
        if (!hymnTitle.trim()) throw new Error("Hymn title is required.");

        const versesArr = parseVerses(versesText);
        if (versesArr.length === 0) {
          throw new Error("Please add at least one verse.");
        }

        // Append fields
        fd.append("hymn_number", String(parsedNumber));
        fd.append("hymn_title", hymnTitle.trim());
        fd.append("classification", classification.trim());
        fd.append("tune_ref", tuneRef.trim());
        fd.append("cross_ref", crossRef.trim());
        fd.append("scripture", scripture.trim());
        fd.append("chorus_title", chorusTitle.trim());
        fd.append("chorus", chorus.trim());

        // Option A (recommended): send verses as JSON
        fd.append("verses", JSON.stringify(versesArr));

        // Option B (common alternative): send repeated keys
        // versesArr.forEach((v) => fd.append("verses", v));
      }

      await api<Hymn>("/hymns", {
        method: "POST",
        body: fd,
      });

      show("Hymn created.");
      onCreated();
      setOpen(false);
      reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      show(e?.message || "Failed to create hymn");
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
            <Music2Icon className="h-4 w-4" /> Create Hymn
          </Button>
        </DialogTrigger>

        <DialogContent
          showCloseButton={false}
          className="max-w-4xl w-full border-0 rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle>Create Hymn</DialogTitle>
            <DialogDescription>
              Add hymn content manually or via TSV upload.
            </DialogDescription>
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
                  <div className="space-y-2">
                    <Label>Hymn Number</Label>
                    <Input
                      value={hymnNumber}
                      onChange={(e) => setHymnNumber(e.target.value)}
                      placeholder="e.g., 101"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-1">
                    <Label>Hymn Title</Label>
                    <Input
                      value={hymnTitle}
                      onChange={(e) => setHymnTitle(e.target.value)}
                      placeholder="e.g., Amazing Grace"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Classification</Label>
                    <Input
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      placeholder="e.g., Praise / Worship"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tune Ref</Label>
                    <Input
                      value={tuneRef}
                      onChange={(e) => setTuneRef(e.target.value)}
                      placeholder="e.g., NEW BRITAIN"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cross Ref</Label>
                    <Input
                      value={crossRef}
                      onChange={(e) => setCrossRef(e.target.value)}
                      placeholder="e.g., Hymn 45"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Scripture</Label>
                    <Input
                      value={scripture}
                      onChange={(e) => setScripture(e.target.value)}
                      placeholder="e.g., John 3:16"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Chorus Title</Label>
                    <Input
                      value={chorusTitle}
                      onChange={(e) => setChorusTitle(e.target.value)}
                      placeholder="e.g., Chorus"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Chorus</Label>
                    <Textarea
                      value={chorus}
                      onChange={(e) => setChorus(e.target.value)}
                      placeholder="Type the chorus here..."
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>
                      Verses{" "}
                      <span title={VERSE_TOOLTIP}>
                        <CircleQuestionMarkIcon className="size-4" />
                      </span>
                    </Label>
                    <Textarea
                      value={versesText}
                      onChange={(e) => setVersesText(e.target.value)}
                      placeholder={VERSE_TOOLTIP}
                      className="min-h-55"
                    />
                    <div className="text-sm text-muted-foreground">
                      Verses detected: {parseVerses(versesText).length}
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
                    hymn_number, hymn_title, classification, tune_ref,
                    cross_ref, scripture, chorus_title, chorus, verse_1,
                    verse_2, verse_3, verse_4... e.t.c
                  </div>
                </div>

                <div className="mt-0.75">
                  <p className="text-sm text-muted-foreground">
                    Add as many verse columns as required in the file.
                  </p>
                </div>
                <div className="mt-1">
                  <p className="text-black text-base">
                    Make sure to replace all blank cells with a hyphen ("-") to
                    avoid conflicts with the system's validation
                  </p>
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
