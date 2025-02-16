import type { Express } from "express";
import { createServer } from "http";
import multer from "multer";
import { storage, binaryStorage } from "./storage";
import * as JavaScriptObfuscator from "javascript-obfuscator";
import { insertCodeSnippetSchema, insertBinaryFileSchema, fileTypes } from "@shared/schema";
import { ZodError } from "zod";
import path from "path";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express) {
  app.post("/api/obfuscate", async (req, res) => {
    try {
      const { originalCode, options } = insertCodeSnippetSchema.parse(req.body);
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(originalCode, {
        ...options,
        sourceMap: false,
        target: 'browser'
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

  app.post("/api/obfuscate/binary", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExt = path.extname(req.file.originalname).toLowerCase().slice(1);
      if (!fileTypes.includes(fileExt as any)) {
        return res.status(400).json({ 
          message: `Unsupported file type. Supported types: ${fileTypes.join(", ")}`
        });
      }

      const fileData = {
        fileName: req.file.originalname,
        fileType: fileExt,
        originalContent: req.file.buffer,
        createdAt: new Date().toISOString(),
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

      // For JavaScript files, apply the obfuscator
      if (fileExt === 'js') {
        const code = req.file.buffer.toString('utf-8');
        const obfuscated = JavaScriptObfuscator.obfuscate(code, {
          ...fileData.options,
          sourceMap: false,
          target: 'browser'
        }).getObfuscatedCode();

        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="obfuscated_${savedFile.fileName}"`
        );
        return res.send(obfuscated);
      }

      // For other binary files (TODO: implement actual binary obfuscation)
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

  const httpServer = createServer(app);
  return httpServer;
}