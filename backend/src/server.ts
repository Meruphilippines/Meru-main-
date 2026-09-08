import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routers
import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";
import adminProgramsRouter from "./routes/adminPrograms";
import adminTestimonialsRouter from "./routes/adminTestimonials";
import adminHistoryRouter from "./routes/adminHistory";
import adminMediaRouter from "./routes/adminMedia";
import adminPagesRouter from "./routes/adminPages";
import adminInboxRouter from "./routes/adminInbox";
import adminContactRouter from "./routes/adminContact";
import adminRegistrationsRouter from "./routes/adminRegistrations";
import adminHomepageRouter from "./routes/adminHomepage";

import publicProgramsRouter from "./routes/publicPrograms";
import publicTestimonialsRouter from "./routes/publicTestimonials";
import publicHistoryRouter from "./routes/publicHistory";
import publicMediaRouter from "./routes/publicMedia";
import publicContactRouter from "./routes/publicContact";
import publicPagesRouter from "./routes/publicPages";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS configuration
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// Body and cookie parsing
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static uploads
const uploadsPath = path.join(process.cwd(), "public", "uploads");
app.use("/uploads", express.static(uploadsPath));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount Admin Routes
app.use("/api/admin/auth", authRouter);
app.use("/api/admin/dashboard", dashboardRouter);
app.use("/api/admin/programs", adminProgramsRouter);
app.use("/api/admin/testimonials", adminTestimonialsRouter);
app.use("/api/admin/history", adminHistoryRouter);
app.use("/api/admin/media", adminMediaRouter);
app.use("/api/admin/pages", adminPagesRouter);
app.use("/api/admin/inbox", adminInboxRouter);
app.use("/api/admin/contact", adminContactRouter);
app.use("/api/admin/registrations", adminRegistrationsRouter);
app.use("/api/admin/homepage", adminHomepageRouter);

// Mount Public Routes
app.use("/api/programs", publicProgramsRouter);
app.use("/api/testimonials", publicTestimonialsRouter);
app.use("/api/history", publicHistoryRouter);
app.use("/api/media", publicMediaRouter);
app.use("/api/contact", publicContactRouter);
app.use("/api/pages", publicPagesRouter);

// Global 404 Handler for API
app.use("/api/*", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`[Meru Backend] Server running on http://localhost:${PORT}`);
});

export default app;
