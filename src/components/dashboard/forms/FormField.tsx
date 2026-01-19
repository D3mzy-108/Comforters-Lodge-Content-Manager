import type { ChangeEventHandler } from "react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

export type FormFieldData = {
  label: string;
  fieldType: "single_line_input" | "multi_line_input";
  inputType: "text" | "number" | "date" | "email" | "password";
  placeHolder: string | undefined;
  value: string | undefined;
  helpText: string | undefined;
  onChange:
    | ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined;
};

export function FormField({ data }: { data: FormFieldData }) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>{data.label}</Label>
      {data.fieldType == "multi_line_input" ? (
        <Textarea
          value={data.value}
          onChange={data.onChange}
          placeholder={data.placeHolder}
        />
      ) : (
        <Input
          value={data.value}
          type={data.inputType}
          onChange={data.onChange}
          placeholder={data.placeHolder}
        />
      )}
      {data.helpText && data.helpText.length > 0 && (
        <div className="text-xs text-muted-foreground">{data.helpText}</div>
      )}
    </div>
  );
}
