import type { Express } from "express";
import { createServer } from "http";
import multer from "multer";
import { storage, binaryStorage } from "./storage";
import * as JavaScriptObfuscator from "javascript-obfuscator";
import { insertCodeSnippetSchema, insertBinaryFileSchema, fileTypes, registryOptions } from "@shared/schema";
import { ZodError } from "zod";
import path from "path";
import { writeFileSync, unlinkSync, promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import { BinaryProcessor } from "./utils/binary-processor";

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
    const tempFiles: string[] = [];
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

      // Parse pump size if provided
      let pumpSizeMB: number | undefined;
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

      // Generate temporary file paths
      const tempId = uuidv4();
      const tempInputPath = `/tmp/${tempId}_input.${fileExt}`;
      const tempOutputPath = `/tmp/${tempId}_output.${fileExt}`;

      // Track temp files for cleanup
      tempFiles.push(tempInputPath, tempOutputPath);

      // Write input file
      writeFileSync(tempInputPath, mainFile.buffer);

      let processedBuffer = mainFile.buffer;

      // Process based on file type
      if (fileExt === 'js') {
        // Handle JavaScript files with the obfuscator
        const code = mainFile.buffer.toString('utf-8');
        const obfuscated = JavaScriptObfuscator.obfuscate(code, {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          stringEncryption: true,
          rotateStringArray: true,
          selfDefending: false,
          sourceMap: false,
          target: 'browser'
        }).getObfuscatedCode();

        processedBuffer = Buffer.from(obfuscated, 'utf-8');
      } else if (fileExt === 'exe' || fileExt === 'msi') {
        // Handle Windows executables
        const processor = new BinaryProcessor(mainFile.buffer);

        if (parsedRegistry) {
          processor.setVersionInfo(BinaryProcessor.fromRegistry(parsedRegistry));
        }

        if (icoFile && fileExt === 'exe') {
          processor.setIcon(icoFile.buffer);
        }

        // Apply file pumping if size is specified
        if (pumpSizeMB) {
          processor.pumpFileSize(pumpSizeMB);
        }

        processedBuffer = processor.getBuffer();
      }

      // Write the processed buffer to output file
      writeFileSync(tempOutputPath, processedBuffer);

      // Save file info to database
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
          filePumpSizeMB: pumpSizeMB,
          registry: parsedRegistry
        }
      };

      const parsedData = insertBinaryFileSchema.parse(fileData);
      await binaryStorage.saveBinaryFile(parsedData);

      // Send the processed file
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
      // Cleanup temporary files
      tempFiles.forEach(file => {
        try {
          unlinkSync(file);
        } catch (e) {
          console.error(`Failed to delete temporary file ${file}:`, e);
        }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}