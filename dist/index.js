// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";

// server/storage.ts
var MemStorage = class {
  snippets;
  currentId;
  constructor() {
    this.snippets = /* @__PURE__ */ new Map();
    this.currentId = 1;
  }
  async saveCodeSnippet(insertSnippet) {
    const id = this.currentId++;
    const snippet = { ...insertSnippet, id };
    this.snippets.set(id, snippet);
    return snippet;
  }
  async getCodeSnippet(id) {
    return this.snippets.get(id);
  }
};
var MemBinaryStorage = class {
  files;
  currentId;
  constructor() {
    this.files = /* @__PURE__ */ new Map();
    this.currentId = 1;
  }
  async saveBinaryFile(insertFile) {
    const id = this.currentId++;
    const file = {
      id,
      fileName: insertFile.fileName,
      fileType: insertFile.fileType,
      originalContent: insertFile.originalContent.toString("base64"),
      obfuscatedContent: Buffer.from([]).toString("base64"),
      options: insertFile.options,
      createdAt: insertFile.createdAt
    };
    this.files.set(id, file);
    return file;
  }
  async getBinaryFile(id) {
    return this.files.get(id);
  }
};
var storage = new MemStorage();
var binaryStorage = new MemBinaryStorage();

// server/routes.ts
import * as JavaScriptObfuscator from "javascript-obfuscator";

// shared/schema.ts
import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var fileTypes = ["exe", "msi", "bat", "js"];
var obfuscationOptions = z.object({
  compact: z.boolean().default(true),
  controlFlowFlattening: z.boolean().default(true),
  deadCodeInjection: z.boolean().default(true),
  stringEncryption: z.boolean().default(true),
  rotateStringArray: z.boolean().default(true),
  selfDefending: z.boolean().default(false),
  renameGlobals: z.boolean().default(false),
  renameProperties: z.boolean().default(false)
});
var binaryFiles = pgTable("binary_files", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  originalContent: text("original_content").notNull(),
  obfuscatedContent: text("obfuscated_content").notNull(),
  options: jsonb("options").notNull().$type(),
  createdAt: text("created_at").notNull()
});
var insertBinaryFileSchema = createInsertSchema(binaryFiles, {
  fileName: z.string(),
  fileType: z.string(),
  originalContent: z.instanceof(Buffer),
  options: obfuscationOptions,
  createdAt: z.string()
}).omit({
  id: true,
  obfuscatedContent: true
});
var codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  originalCode: text("original_code").notNull(),
  obfuscatedCode: text("obfuscated_code").notNull(),
  options: jsonb("options").notNull().$type()
});
var insertCodeSnippetSchema = createInsertSchema(codeSnippets);

// server/routes.ts
import { ZodError } from "zod";
import path from "path";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB limit
  }
});
async function registerRoutes(app2) {
  app2.post("/api/obfuscate", async (req, res) => {
    try {
      const { originalCode, options } = insertCodeSnippetSchema.parse(req.body);
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(originalCode, {
        ...options,
        sourceMap: false,
        target: "browser"
      }).getObfuscatedCode();
      const snippet = await storage.saveCodeSnippet({
        originalCode,
        obfuscatedCode,
        options
      });
      res.json(snippet);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to obfuscate code" });
      }
    }
  });
  app2.post("/api/obfuscate/binary", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileExt = path.extname(req.file.originalname).toLowerCase().slice(1);
      if (!fileTypes.includes(fileExt)) {
        return res.status(400).json({
          message: `Unsupported file type. Supported types: ${fileTypes.join(", ")}`
        });
      }
      const fileData = {
        fileName: req.file.originalname,
        fileType: fileExt,
        originalContent: req.file.buffer,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        options: {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          stringEncryption: true,
          rotateStringArray: true,
          selfDefending: false,
          renameGlobals: false,
          renameProperties: false
        }
      };
      const parsedData = insertBinaryFileSchema.parse(fileData);
      const savedFile = await binaryStorage.saveBinaryFile(parsedData);
      if (fileExt === "js") {
        const code = req.file.buffer.toString("utf-8");
        const obfuscated = JavaScriptObfuscator.obfuscate(code, {
          ...fileData.options,
          sourceMap: false,
          target: "browser"
        }).getObfuscatedCode();
        res.setHeader("Content-Type", "application/javascript");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="obfuscated_${savedFile.fileName}"`
        );
        return res.send(obfuscated);
      }
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="obfuscated_${savedFile.fileName}"`
      );
      res.send(savedFile.originalContent);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Error processing file:", error);
        res.status(500).json({ message: "Failed to process file" });
      }
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared")
    }
  },
  root: path2.resolve(__dirname, "client"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
}
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message || "Internal Server Error";
    if (process.env.NODE_ENV !== "production") {
      console.error(err);
    }
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = process.env.PORT || 5e3;
  const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
  server.listen(PORT, HOST, () => {
    log(`Server running in ${app.get("env")} mode on port ${PORT}`);
  });
})();
