import z from "zod";

import { avatarSchema } from "./const";

export type Avatar = z.infer<typeof avatarSchema>;
