import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import { ConfirmState } from "./state";
import { ConfirmData, ConfirmDataOpts } from "./types";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const Modal = (props: {
  message: string;
  opts?: ConfirmDataOpts;
  onConfirm: (boolean: boolean) => void;
}) => {
  const { message, opts = {}, onConfirm } = props;
  const { title = "Confirm", ctaText = "Ok", cancelText = "Cancel" } = opts;
  const btnClassName = "px-4 py-2";
  return (
    <Dialog open onOpenChange={() => onConfirm(false)}>
      <DialogContent className="max-w-96 border-none rounded-sm text-foreground">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-foreground">{message}</p>
        <DialogFooter className="gap-1">
          <Button
            variant={"outline"}
            className={btnClassName}
            onClick={() => onConfirm(false)}
          >
            {cancelText}
          </Button>
          <Button
            variant={"default"}
            className={btnClassName}
            onClick={() => onConfirm(true)}
          >
            {ctaText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const Confirm: React.FC = () => {
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);

  useEffect(() => {
    const unsubscribe = ConfirmState.subscribe((data) => {
      setConfirmData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConfirm = (result: boolean) => {
    if (confirmData) {
      ConfirmState.resolveConfirm(confirmData.id, result);
      setConfirmData(null);
    }
  };

  if (!confirmData) {
    return null;
  }

  return ReactDOM.createPortal(
    <Modal
      message={confirmData.message}
      onConfirm={handleConfirm}
      opts={confirmData.opts}
    />,
    document.body
  );
};
