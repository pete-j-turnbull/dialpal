export type ConfirmDataOpts = {
  title?: string;
  ctaText?: string;
  cancelText?: string;
};

export type ConfirmData = {
  id: number;
  message: string;
  resolve: (result: boolean) => void;
  opts?: ConfirmDataOpts;
};
