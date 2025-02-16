import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import * as JavaScriptObfuscator from "javascript-obfuscator";
import { insertCodeSnippetSchema } from "@shared/schema";
import { ZodError } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
