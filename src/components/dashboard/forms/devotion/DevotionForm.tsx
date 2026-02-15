"use client";
import { useState } from "react";
import { useToastLike } from "../../../toastFeedback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Button } from "../../../ui/button";
import { FileUpIcon, FolderIcon, Music2Icon } from "lucide-react";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { api } from "../../../../utils/api/api_connection";
import type { DailyDevotion, UploadMode } from "../../../../utils/schemas";
import BaseFormLayout from "../BaseFormLayout";
import { FormField, type FormFieldData } from "../FormField";

export default function DevotionFormDialog({
  devotionData,
  onCreated,
  children,
}: {
  devotionData: DailyDevotion | undefined;
  onCreated: () => void;
  children: React.ReactNode | undefined;
}) {
  const { show, node } = useToastLike();
  const [mode, setMode] = useState<UploadMode>("single");
  // SINGLE FIELDS
  const [citation, setCitation] = useState(devotionData?.citation || "");
  const [verseContent, setVerseContent] = useState(
    devotionData?.verse_content || "",
  );
  const [prayer, setPrayer] = useState(devotionData?.prayer || "");
  const [datePosted, setDatePosted] = useState(devotionData?.date_posted || "");
  // const [image, setImage] = useState<File | null>(null);
  // TSV
  const [tsv, setTsv] = useState<File | null>(null);
  // FORM FIELDS
  const formFields: FormFieldData[] = [
    {
      label: "Citation / Bible Verse",
      fieldType: "single_line_input" as const,
      inputType: "text",
      placeHolder: "e.g., John 3:16",
      value: citation,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setCitation(e.target.value),
    },
    {
      label: "Verse Content",
      fieldType: "multi_line_input" as const,
      inputType: "text",
      placeHolder: "Type the verse content here...",
      value: verseContent,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setVerseContent(e.target.value),
    },
    {
      label: "Prayer",
      fieldType: "multi_line_input" as const,
      inputType: "text",
      placeHolder: "Type prayer here...",
      value: prayer,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setPrayer(e.target.value),
    },
    {
      label: "Date Posted (optional)",
      fieldType: "single_line_input" as const,
      inputType: "date",
      placeHolder: "e.g., 2024-01-01",
      value: datePosted,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDatePosted(e.target.value),
    },
  ];

  const reset = () => {
    setCitation("");
    setVerseContent("");
    setDatePosted("");
    // setImage(null);
  };

  const submit = async () => {
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
        fd.append("prayer", prayer);
        if (datePosted.trim()) fd.append("date_posted", datePosted.trim());
      }

      if (devotionData !== undefined) {
        await api<DailyDevotion>(`/devotions/${devotionData.id}`, {
          method: "PATCH",
          body: fd,
        });
      } else {
        await api<DailyDevotion>("/devotions", {
          method: "POST",
          body: fd,
        });
      }

      show("Devotion created.");
      onCreated();
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      show(e?.message || "Failed to create devotion");
      return false;
    }
  };

  return (
    <>
      {node}
      <BaseFormLayout
        title="Create Daily Devotion"
        description="Add scripture content."
        reset={reset}
        onSubmit={submit}
      >
        <BaseFormLayout.Trigger>
          {children ?? (
            <Button className="gap-2 rounded-2xl">
              <Music2Icon className="h-4 w-4" /> Create Devotion
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
                disabled={devotionData !== undefined}
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
                    citation, verse_content, prayer, date_posted
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
        </BaseFormLayout.Content>
      </BaseFormLayout>
    </>
  );
}
