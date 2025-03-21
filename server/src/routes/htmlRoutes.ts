import path from "path";
import { fileURLToPath } from "url";
import { Router, Request, Response } from "express";

const router = Router();

// ✅ FIX: Properly define __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve `index.html`
router.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
});

export default router;
