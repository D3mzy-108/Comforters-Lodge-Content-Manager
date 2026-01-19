import React, { useState } from "react";
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

type BaseDialogProps = {
  title: string;
  description: string;
  reset: () => void;
  onSubmit: () => Promise<boolean>;
  children: React.ReactNode;
};

function isElementOfType(
  element: React.ReactNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>,
): element is React.ReactElement {
  return React.isValidElement(element) && element.type === component;
}

function Trigger({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
function Content({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function BaseFormLayout({
  title,
  description,
  reset,
  onSubmit,
  children,
}: BaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const childArray = React.Children.toArray(children);

  const trigger = childArray.find((c) => isElementOfType(c, Trigger));
  const content = childArray.find((c) => isElementOfType(c, Content));

  const submitForm = async () => {
    setBusy(true);
    const actionSuccessful = await onSubmit();
    if (actionSuccessful) {
      setOpen(false);
      reset();
    }
    setBusy(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <div className="w-fit">{trigger}</div>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl w-full border-0 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {content ?? <></>}

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
            onClick={submitForm}
            disabled={busy}
            className="gap-2 rounded-2xl primary-btn"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

BaseFormLayout.Trigger = Trigger;
BaseFormLayout.Content = Content;

export default BaseFormLayout;
