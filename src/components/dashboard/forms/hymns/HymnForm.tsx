"use client";
import { useState } from "react";
import { useToastLike } from "../../../toastFeedback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Button } from "../../../ui/button";
import { FileUpIcon, FolderIcon, Music2Icon } from "lucide-react";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { api } from "../../../../utils/api/api_connection";
import type { UploadMode } from "../../../../utils/schemas";
import { FormField, type FormFieldData } from "../FormField";
import BaseFormLayout from "../BaseFormLayout";

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

export default function HymnFormDialog({
  hymnData,
  onCreated,
  children,
}: {
  hymnData: Hymn | undefined;
  onCreated: () => void;
  children: React.ReactNode | undefined;
}) {
  const { show, node } = useToastLike();
  const [mode, setMode] = useState<UploadMode>("single");
  // SINGLE FIELDS
  const [hymnNumber, setHymnNumber] = useState<string>(
    hymnData?.hymn_number.toString() || "",
  );
  const [hymnTitle, setHymnTitle] = useState(hymnData?.hymn_title || "");
  const [classification, setClassification] = useState(
    hymnData?.classification || "",
  );
  const [tuneRef, setTuneRef] = useState(hymnData?.tune_ref || "");
  const [crossRef, setCrossRef] = useState(hymnData?.cross_ref || "");
  const [scripture, setScripture] = useState(hymnData?.scripture || "");
  const [chorusTitle, setChorusTitle] = useState(hymnData?.chorus_title || "");
  const [chorus, setChorus] = useState(hymnData?.chorus || "");
  // Verses UX: simple textarea that we split into an array
  // Tip: separate verses with a blank line.
  const [versesText, setVersesText] = useState(
    hymnData?.verses?.join("\n\n") || "",
  );
  // TSV
  const [tsv, setTsv] = useState<File | null>(null);

  const parseVerses = (text: string): string[] => {
    return text
      .split(/\n\s*\n/g)
      .map((v) => v.trim())
      .filter(Boolean);
  };

  // FORM FIELDS
  const formFields: FormFieldData[] = [
    {
      label: "Hymn Number",
      fieldType: "single_line_input",
      inputType: "number",
      placeHolder: "e.g., 101",
      value: hymnNumber,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setHymnNumber(e.target.value),
    },
    {
      label: "Hymn Title",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "e.g., Amazing Grace",
      value: hymnTitle,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setHymnTitle(e.target.value),
    },
    {
      label: "Classification",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "e.g., Praise / Worship",
      value: classification,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setClassification(e.target.value),
    },
    {
      label: "Tune Ref",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "e.g., 101",
      value: tuneRef,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTuneRef(e.target.value),
    },
    {
      label: "Cross Ref",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "e.g., 101",
      value: crossRef,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setCrossRef(e.target.value),
    },
    {
      label: "Scripture",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "e.g., John 3:16",
      value: scripture,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setScripture(e.target.value),
    },
    {
      label: "Chorus Title",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "e.g., Chorus",
      value: chorusTitle,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setChorusTitle(e.target.value),
    },
    {
      label: "Chorus",
      fieldType: "multi_line_input",
      inputType: "text",
      placeHolder: "Type the chorus here...",
      value: chorus,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setChorus(e.target.value),
    },
    {
      label: "Verses",
      fieldType: "multi_line_input",
      inputType: "text",
      placeHolder: VERSE_TOOLTIP,
      value: versesText,
      helpText: `Verses detected: ${parseVerses(versesText).length}`,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setVersesText(e.target.value),
    },
  ];

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

  const submit = async () => {
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
        versesArr.forEach((v) => {
          fd.append(`verses`, v);
        });

        // Option B (common alternative): send repeated keys
        // versesArr.forEach((v) => fd.append("verses", v));
      }

      if (hymnData !== undefined) {
        await api<Hymn>(`/hymns/${hymnData.id}`, {
          method: "PATCH",
          body: fd,
        });
      } else {
        await api<Hymn>("/hymns", {
          method: "POST",
          body: fd,
        });
      }

      show("Hymn created.");
      onCreated();
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      show(e?.message || "Failed to create hymn");
      return false;
    }
  };

  return (
    <>
      {node}
      <BaseFormLayout
        title="Create Hymn"
        description="Add hymn content manually or via TSV upload."
        reset={reset}
        onSubmit={submit}
      >
        <BaseFormLayout.Trigger>
          {children ?? (
            <Button className="gap-2 rounded-2xl primary-btn">
              <Music2Icon className="h-4 w-4" /> Create Hymn
            </Button>
          )}
        </BaseFormLayout.Trigger>
        <BaseFormLayout.Content>
          <Tabs value={mode} onValueChange={(v) => setMode(v as UploadMode)}>
            <TabsList className="grid w-full grid-cols-2 pb-12">
              <TabsTrigger className="tab-style" value="single">
                Single
              </TabsTrigger>
              <TabsTrigger
                className="tab-style gap-2"
                value="tsv"
                disabled={hymnData !== undefined}
              >
                <FileUpIcon className="h-4 w-4" /> Bulk TSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-4 space-y-4">
              <div className="scroll-style">
                <div className="grid gap-4 sm:grid-cols-2">
                  {formFields.map((field, idx) => (
                    <FormField key={idx} data={field} />
                  ))}
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
        </BaseFormLayout.Content>
      </BaseFormLayout>
    </>
  );
}
