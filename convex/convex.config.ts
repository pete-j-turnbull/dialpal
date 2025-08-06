import { defineApp } from "convex/server";
import crons from "@convex-dev/crons/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import cache from "@convex-dev/action-cache/convex.config";
import retrier from "@convex-dev/action-retrier/convex.config";
import migrations from "@convex-dev/migrations/convex.config";

const app = defineApp();

app.use(crons);
app.use(workflow);
app.use(cache);
app.use(retrier);
app.use(migrations);

export default app;
