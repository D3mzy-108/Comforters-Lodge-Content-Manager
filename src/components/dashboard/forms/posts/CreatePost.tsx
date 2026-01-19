"use client";
import { useState } from "react";
import { useToastLike } from "../../../toastFeedback";
import { Button } from "../../../ui/button";
import { FileUpIcon, FolderIcon, PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { api } from "../../../../utils/api/api_connection";
import type { DailyPost, UploadMode } from "../../../../utils/schemas";
import { FormField, type FormFieldData } from "../FormField";
import BaseFormLayout from "../BaseFormLayout";

export default function CreatePostDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { show, node } = useToastLike();
  const [mode, setMode] = useState<UploadMode>("single");
  // Single fields
  const [series_title, setSeriesTitle] = useState("");
  const [openingHook, setOpeningHook] = useState("");
  const [theme, setTheme] = useState("");
  const [personalQuestion, setPersonalQuestion] = useState("");
  const [biblicalQA, setBiblicalQA] = useState("");
  const [reflection, setReflection] = useState("");
  const [story, setStory] = useState("");
  const [prayer, setPrayer] = useState("");
  const [activityGuide, setActivityGuide] = useState("");
  const [datePosted, setDatePosted] = useState("");
  // TSV
  const [tsv, setTsv] = useState<File | null>(null);
  // Form Fields
  const formFields: FormFieldData[] = [
    {
      label: "Series Title",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "Arresting one-liner…",
      value: series_title,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setSeriesTitle(e.target.value),
    },
    {
      label: "Personal Question",
      fieldType: "multi_line_input",
      inputType: "text",
      placeHolder: "Piercing self-examination…",
      value: personalQuestion,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setPersonalQuestion(e.target.value),
    },
    {
      label: "Theme",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "Arresting one-liner…",
      value: theme,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTheme(e.target.value),
    },
    {
      label: "Opening Hook",
      fieldType: "single_line_input",
      inputType: "text",
      placeHolder: "Arresting one-liner…",
      value: openingHook,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setOpeningHook(e.target.value),
    },
    {
      label: "Biblical Question & Answer",
      fieldType: "multi_line_input",
      inputType: "text",
      placeHolder: "Jesus’ actual encounter…",
      value: biblicalQA,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setBiblicalQA(e.target.value),
    },
    {
      label: "Reflection",
      fieldType: "multi_line_input",
      inputType: "text",
      placeHolder: "Theological unpacking…",
      value: reflection,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setReflection(e.target.value),
    },
    {
      label: "Story",
      fieldType: "multi_line_input",
      inputType: "text",
      placeHolder: "Contextualized testimony…",
      value: story,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setStory(e.target.value),
    },
    {
      label: "Prayer",
      fieldType: "multi_line_input",
      inputType: "text",
      placeHolder: "Personal, honest, actionable…",
      value: prayer,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setPrayer(e.target.value),
    },
    {
      label: "Activity Guide",
      fieldType: "multi_line_input",
      inputType: "text",
      placeHolder: "One concrete step…",
      value: activityGuide,
      helpText: undefined,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setActivityGuide(e.target.value),
    },
    {
      label: "Date Posted (optional)",
      fieldType: "single_line_input",
      inputType: "date",
      placeHolder: "YYYY-MM-DD",
      value: datePosted,
      helpText: "If omitted, the server will default to today.",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDatePosted(e.target.value),
    },
  ];

  const reset = () => {
    setSeriesTitle("");
    setOpeningHook("");
    setTheme("");
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
    try {
      const fd = new FormData();

      if (mode === "tsv") {
        if (!tsv) throw new Error("Please choose a TSV file.");
        fd.append("tsv_file", tsv);
      } else {
        // Append fields for single create
        fd.append("series_title", series_title);
        fd.append("personal_question", personalQuestion);
        fd.append("theme", theme);
        fd.append("opening_hook", openingHook);
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
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      show(e?.message || "Failed to create post");
      return false;
    }
  };

  return (
    <>
      {node}
      <BaseFormLayout
        title="Create Daily Post"
        description="Add a single post via form, or upload a TSV for bulk creation."
        reset={reset}
        onSubmit={submit}
      >
        <BaseFormLayout.Trigger>
          <Button className="gap-2 rounded-2xl primary-btn">
            <PlusIcon className="h-4 w-4" /> Create Post
          </Button>
        </BaseFormLayout.Trigger>

        <BaseFormLayout.Content>
          <Tabs value={mode} onValueChange={(v) => setMode(v as UploadMode)}>
            <TabsList className="grid w-full grid-cols-2 pb-12">
              <TabsTrigger className="tab-style" value="single">
                Single
              </TabsTrigger>
              <TabsTrigger className="tab-style gap-2" value="tsv">
                <FileUpIcon className="h-4 w-4" />
                Bulk TSV
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
                    series_title, opening_hook, theme, personal_question,
                    biblical_qa, reflection, story, prayer, activity_guide,
                    date_posted
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
