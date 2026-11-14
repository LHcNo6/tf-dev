import { Router } from "express";
import { getImageCommands } from "@/lib/imageCommands";
import { success } from "@/lib/responseFormat";

export default Router().get("/", (_req, res) => {
  res.set("Cache-Control", "no-store").json(success(getImageCommands()));
});
