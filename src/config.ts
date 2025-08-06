import { requireEnv } from "../env";

const env = requireEnv("nextPublic");

export const config = {
  ...env.nextPublic,
  posthogApiKey: "phc_hpR9JEYaYi66lxFOSKqduZfULOUGgn0RxwfkWNsZXpx", // TODO: should be in nextEnv
  uploadDomain: "https://assets.staging.yuzulabs.io",
};
