import { requireEnv } from "../env";

const env = requireEnv("nextPublic");

export const config = {
  ...env.nextPublic,
};
