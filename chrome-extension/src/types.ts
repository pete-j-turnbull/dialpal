export type InsertOp = {
  t: "ins";
  pos: number;
  text: string;
};

export type DeleteOp = {
  t: "del";
  pos: number;
  len: number;
};

export type DiffOp = InsertOp | DeleteOp;

export type DiffEvent = {
  ts: string; // new Date().toISOString()
  docId: string;
  docUrl: string; // location.href
  installId: string;
  sampleMs: 30000;
  source: "chrome-ext@v1";
  oldHash: string | null; // sha256 of previous text or null on first send
  newHash: string; // sha256 of current text
  ops: DiffOp[];
  meta?: {
    title?: string; // document.title (trim " - Google Docs")
    userLocale?: string; // navigator.language
    encoding?: "gzip+base64"; // if used
  };
};

export type ExtensionState = {
  lastText: string;
  lastHash: string | null;
  installId: string;
  active: boolean;
  typedRecently: boolean;
  hasInitialFetch: boolean;
};

export type BackoffState = {
  [key: string]: {
    count: number;
    nextRetryTime: number;
  };
};
