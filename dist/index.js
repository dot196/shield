var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  binaryFiles: () => binaryFiles,
  codeSnippets: () => codeSnippets,
  fileTypes: () => fileTypes,
  insertBinaryFileSchema: () => insertBinaryFileSchema,
  insertCodeSnippetSchema: () => insertCodeSnippetSchema,
  obfuscationOptions: () => obfuscationOptions,
  predefinedProfiles: () => predefinedProfiles,
  registryOptions: () => registryOptions
});
import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var fileTypes = ["exe", "msi", "bat", "apk", "js", "ico"];
var registryOptions = z.object({
  companyName: z.string(),
  productName: z.string(),
  description: z.string(),
  version: z.string(),
  copyright: z.string(),
  originalFilename: z.string().optional(),
  trademarks: z.string().optional(),
  comments: z.string().optional()
});
var predefinedProfiles = {
  google: {
    companyName: "Google LLC",
    productName: "Google Application",
    description: "Google Application Service",
    version: "1.0.0.0",
    copyright: "Copyright \xA9 Google LLC",
    trademarks: "Google\u2122 is a trademark of Google LLC"
  },
  microsoft: {
    companyName: "Microsoft Corporation",
    productName: "Microsoft Application",
    description: "Microsoft Windows Application",
    version: "1.0.0.0",
    copyright: "Copyright \xA9 Microsoft Corporation",
    trademarks: "Microsoft\xAE is a registered trademark of Microsoft Corporation"
  }
};
var obfuscationOptions = z.object({
  compact: z.boolean().default(true),
  controlFlowFlattening: z.boolean().default(true),
  deadCodeInjection: z.boolean().default(true),
  stringEncryption: z.boolean().default(true),
  rotateStringArray: z.boolean().default(true),
  selfDefending: z.boolean().default(false),
  renameGlobals: z.boolean().default(false),
  renameProperties: z.boolean().default(false),
  filePumpSizeMB: z.number().min(0).optional(),
  registry: registryOptions.optional()
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
  originalContent: z.string(),
  options: obfuscationOptions,
  createdAt: z.string()
}).omit({
  id: true,
  obfuscatedContent: true
});
var codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  originalCode: text("original_code").notNull(),
  obfuscatedCode: text("obfuscated_content").notNull(),
  options: jsonb("options").notNull().$type()
});
var insertCodeSnippetSchema = createInsertSchema(codeSnippets);

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async saveCodeSnippet(insertSnippet) {
    const [snippet] = await db.insert(codeSnippets).values(insertSnippet).returning();
    return snippet;
  }
  async getCodeSnippet(id) {
    const [snippet] = await db.select().from(codeSnippets).where(eq(codeSnippets.id, id));
    return snippet;
  }
};
var DatabaseBinaryStorage = class {
  async saveBinaryFile(insertFile) {
    const [savedFile] = await db.insert(binaryFiles).values({
      ...insertFile,
      obfuscatedContent: ""
      // Will be set during obfuscation
    }).returning();
    return savedFile;
  }
  async getBinaryFile(id) {
    const [file] = await db.select().from(binaryFiles).where(eq(binaryFiles.id, id));
    return file;
  }
};
var storage = new DatabaseStorage();
var binaryStorage = new DatabaseBinaryStorage();

// server/routes.ts
import * as JavaScriptObfuscator from "javascript-obfuscator";
import { ZodError } from "zod";
import path from "path";
import { writeFileSync, unlinkSync, promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";

// server/utils/binary-processor.ts
var BinaryProcessor = class {
  buffer;
  constructor(buffer) {
    this.buffer = buffer;
  }
  setVersionInfo(info) {
    return;
  }
  setIcon(iconBuffer) {
    return;
  }
  pumpFileSize(targetSizeMB) {
    const currentSizeBytes = this.buffer.length;
    const targetSizeBytes = targetSizeMB * 1024 * 1024;
    if (targetSizeBytes <= currentSizeBytes) {
      return;
    }
    const bytesToAdd = targetSizeBytes - currentSizeBytes;
    const marker = Buffer.from("DLINQNT_PUMP_DATA");
    const randomData = Buffer.alloc(bytesToAdd - marker.length);
    const junkPatterns = [
      "function ",
      "var ",
      "const ",
      "let ",
      "if(",
      "while(",
      "return ",
      "console.log(",
      "{ ",
      "} ",
      ";",
      "\n"
    ];
    let position = 0;
    while (position < randomData.length) {
      const pattern = junkPatterns[Math.floor(Math.random() * junkPatterns.length)];
      const patternBuffer = Buffer.from(pattern);
      const remainingSpace = randomData.length - position;
      if (remainingSpace >= patternBuffer.length) {
        patternBuffer.copy(randomData, position);
        position += patternBuffer.length;
      } else {
        break;
      }
    }
    for (let i = position; i < randomData.length; i++) {
      randomData[i] = Math.floor(Math.random() * 256);
    }
    this.buffer = Buffer.concat([this.buffer, marker, randomData]);
  }
  getBuffer() {
    return this.buffer;
  }
  static fromRegistry(registry) {
    return {
      companyName: registry.companyName,
      productName: registry.productName,
      fileDescription: registry.description,
      fileVersion: registry.version,
      productVersion: registry.version,
      legalCopyright: registry.copyright,
      legalTrademarks: registry.trademarks
    };
  }
};

// server/routes.ts
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
  app2.post("/api/obfuscate/binary", upload.fields([
    { name: "file", maxCount: 1 },
    { name: "ico", maxCount: 1 }
  ]), async (req, res) => {
    const tempFiles = [];
    try {
      const files = req.files;
      const mainFile = files["file"]?.[0];
      const icoFile = files["ico"]?.[0];
      if (!mainFile) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileExt = path.extname(mainFile.originalname).toLowerCase().slice(1);
      if (!fileTypes.includes(fileExt)) {
        return res.status(400).json({
          message: `Unsupported file type. Supported types: ${fileTypes.join(", ")}`
        });
      }
      let parsedRegistry;
      if (req.body.registry) {
        try {
          const registryData = JSON.parse(req.body.registry);
          parsedRegistry = registryOptions.parse(registryData);
        } catch (e) {
          return res.status(400).json({
            message: "Invalid registry information provided"
          });
        }
      }
      let pumpSizeMB;
      if (req.body.pumpSize) {
        try {
          pumpSizeMB = parseInt(req.body.pumpSize);
          if (isNaN(pumpSizeMB) || pumpSizeMB < 0) {
            throw new Error("Invalid pump size");
          }
        } catch (e) {
          return res.status(400).json({
            message: "Invalid file pump size provided"
          });
        }
      }
      const tempId = uuidv4();
      const tempInputPath = `/tmp/${tempId}_input.${fileExt}`;
      const tempOutputPath = `/tmp/${tempId}_output.${fileExt}`;
      tempFiles.push(tempInputPath, tempOutputPath);
      writeFileSync(tempInputPath, mainFile.buffer);
      let processedBuffer = mainFile.buffer;
      if (fileExt === "js") {
        const code = mainFile.buffer.toString("utf-8");
        const obfuscated = JavaScriptObfuscator.obfuscate(code, {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          stringEncryption: true,
          rotateStringArray: true,
          selfDefending: false,
          sourceMap: false,
          target: "browser"
        }).getObfuscatedCode();
        processedBuffer = Buffer.from(obfuscated, "utf-8");
      } else if (fileExt === "exe" || fileExt === "msi") {
        const processor = new BinaryProcessor(mainFile.buffer);
        if (parsedRegistry) {
          processor.setVersionInfo(BinaryProcessor.fromRegistry(parsedRegistry));
        }
        if (icoFile && fileExt === "exe") {
          processor.setIcon(icoFile.buffer);
        }
        if (pumpSizeMB) {
          processor.pumpFileSize(pumpSizeMB);
        }
        processedBuffer = processor.getBuffer();
      }
      writeFileSync(tempOutputPath, processedBuffer);
      const fileData = {
        fileName: mainFile.originalname,
        fileType: fileExt,
        originalContent: mainFile.buffer.toString("base64"),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        options: {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          stringEncryption: true,
          rotateStringArray: true,
          selfDefending: false,
          renameGlobals: false,
          renameProperties: false,
          filePumpSizeMB: pumpSizeMB,
          registry: parsedRegistry
        }
      };
      const parsedData = insertBinaryFileSchema.parse(fileData);
      await binaryStorage.saveBinaryFile(parsedData);
      const processedFileContent = await fs.readFile(tempOutputPath);
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="obfuscated_${mainFile.originalname}"`
      );
      res.send(processedFileContent);
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ message: "Failed to process file" });
    } finally {
      tempFiles.forEach((file) => {
        try {
          unlinkSync(file);
        } catch (e) {
          console.error(`Failed to delete temporary file ${file}:`, e);
        }
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
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
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
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
  if (!fs2.existsSync(distPath)) {
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
    log(`Server running in ${app.get("env")} mode on ${HOST}:${PORT}`);
  });
})();
