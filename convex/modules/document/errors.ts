export class SyncConflictError extends Error {
  constructor(
    public expectedHash: string | undefined,
    public actualHash: string | undefined
  ) {
    super(
      `Sync conflict: expected hash ${expectedHash} but document has ${actualHash}`
    );
    this.name = "SyncConflictError";
  }
}
