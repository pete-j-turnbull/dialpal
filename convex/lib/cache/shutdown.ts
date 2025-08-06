"use node";

const shutdownListeners: (() => Promise<void> | void)[] = [];

/**
 * A helper function to register a function to be called when the process is shutting down
 * @param callback The function to be called and awaited on when the process is shutting down
 */
export const onShutdown = (callback: () => Promise<void> | void): void => {
  shutdownListeners.push(callback);
};

const shutdown = async () => {
  await Promise.all(
    shutdownListeners.map(async (l) => {
      try {
        await l();
      } catch (e) {
        /** ignore */
      }
    })
  );
  process.exit(0);
};

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down...");
  await shutdown();
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  await shutdown();
});
