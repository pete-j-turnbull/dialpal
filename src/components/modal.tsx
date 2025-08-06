import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useScreenSize } from "./hooks/use-screensize";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Dialog, DialogContent } from "./ui/dialog";

type Props = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  wide?: boolean;
}>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * This hook is used to delay the calling of an onClose function
 * this is to make the UX better when used with navigation
 * otherwise there is no time allowed for the animation
 * @param open
 * @param onClose
 * @returns
 */
export const useModalCloseDelay = (open: boolean, onClose: () => void) => {
  const [modalOpen, setModalOpen] = useState(open);

  const closeModal = useCallback(async () => {
    setModalOpen(false);
    await sleep(100);
    onClose();
  }, [onClose]);

  // each time controller open changes make sure state is updated
  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  // after overriding state, make sure to update to the
  // contoller open
  useEffect(() => {
    if (!modalOpen && open) {
      void sleep(300).then(() => {
        setModalOpen(open);
      });
    }
  }, [modalOpen, open]);

  return {
    modalOpen,
    closeModal,
  };
};

export const Modal = (props: Props) => {
  const { open, onClose, wide } = props;
  const { isMobile } = useScreenSize();

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        onClose();
      }
    },
    [onClose]
  );

  if (isMobile) {
    return (
      <Drawer open={open} onClose={onClose} dismissible={false}>
        <DrawerContent>{props.children}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("flex max-h-[97dvh] flex-col gap-0 p-0", {
          "max-w-2xl": wide,
        })}
      >
        {props.children}
      </DialogContent>
    </Dialog>
  );
};
