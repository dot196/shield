import type { Express } from "express";
import { createServer } from "http";
import multer from "multer";
import { storage, binaryStorage } from "./storage";
import * as JavaScriptObfuscator from "javascript-obfuscator";
import { insertCodeSnippetSchema, insertBinaryFileSchema, fileTypes, registryOptions } from "@shared/schema";
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

  app.post("/api/obfuscate/binary", upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'ico', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const mainFile = files['file']?.[0];
      const icoFile = files['ico']?.[0];

      if (!mainFile) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExt = path.extname(mainFile.originalname).toLowerCase().slice(1);
      if (!fileTypes.includes(fileExt as any)) {
        return res.status(400).json({ 
          message: `Unsupported file type. Supported types: ${fileTypes.join(", ")}`
        });
      }

      // Parse registry options if provided
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

      const fileData = {
        fileName: mainFile.originalname,
        fileType: fileExt,
        originalContent: mainFile.buffer.toString('base64'),
        createdAt: new Date().toISOString(),
        options: {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          stringEncryption: true,
          rotateStringArray: true,
          selfDefending: false,
          renameGlobals: false,
          renameProperties: false,
          registry: parsedRegistry // Include parsed registry options
        }
      };

      const parsedData = insertBinaryFileSchema.parse(fileData);
      const savedFile = await binaryStorage.saveBinaryFile(parsedData);

      // For JavaScript files, apply the obfuscator
      if (fileExt === 'js') {
        const code = mainFile.buffer.toString('utf-8');
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

      // For other binary files
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename="obfuscated_${savedFile.fileName}"`
      );
      res.send(Buffer.from(savedFile.originalContent, 'base64'));

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