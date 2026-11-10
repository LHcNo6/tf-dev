import { Router } from "express";
import { z } from "zod";
import { validateFields } from "@/lib/middleware";
import { success } from "@/lib/responseFormat";
import u from "@/utils";

export default Router().post("/", validateFields({
  directory: z.string().min(1).max(4096), canvasId: z.string().min(1).max(4096), nodeId: z.string().min(1).max(256), callId: z.uuid(),
}), async (req, res) => {
  const cwd = await u.workspace.resolveWorkspace(req, req.body.directory);
  await u.mediaTasks.retryCall(cwd, req.body, req.body.callId);
  res.json(success());
});
