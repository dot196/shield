import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fileTypes = ['exe', 'msi', 'bat', 'apk', 'js', 'ico'] as const;
export type FileType = typeof fileTypes[number];

export const registryOptions = z.object({
  companyName: z.string(),
  productName: z.string(),
  description: z.string(),
  version: z.string(),
  copyright: z.string(),
  originalFilename: z.string().optional(),
  trademarks: z.string().optional(),
  comments: z.string().optional()
});

export type RegistryOptions = z.infer<typeof registryOptions>;

export const predefinedProfiles = {
  google: {
    companyName: "Google LLC",
    productName: "Google Application",
    description: "Google Application Service",
    version: "1.0.0.0",
    copyright: "Copyright © Google LLC",
    trademarks: "Google™ is a trademark of Google LLC"
  },
  microsoft: {
    companyName: "Microsoft Corporation",
    productName: "Microsoft Application",
    description: "Microsoft Windows Application",
    version: "1.0.0.0",
    copyright: "Copyright © Microsoft Corporation",
    trademarks: "Microsoft® is a registered trademark of Microsoft Corporation"
  },
  apple: {
    companyName: "Apple Inc.",
    productName: "Apple Application",
    description: "Apple System Service",
    version: "1.0.0.0",
    copyright: "Copyright © Apple Inc.",
    trademarks: "Apple® is a registered trademark of Apple Inc."
  },
  adobe: {
    companyName: "Adobe Inc.",
    productName: "Adobe Application",
    description: "Adobe Creative Cloud Service",
    version: "1.0.0.0",
    copyright: "Copyright © Adobe Inc.",
    trademarks: "Adobe® is a registered trademark of Adobe Inc."
  },
  oracle: {
    companyName: "Oracle Corporation",
    productName: "Oracle Application",
    description: "Oracle Enterprise Service",
    version: "1.0.0.0",
    copyright: "Copyright © Oracle Corporation",
    trademarks: "Oracle® is a registered trademark of Oracle Corporation"
  },
  amazon: {
    companyName: "Amazon.com Inc.",
    productName: "AWS Application",
    description: "Amazon Web Services Application",
    version: "1.0.0.0",
    copyright: "Copyright © Amazon.com Inc.",
    trademarks: "AWS® is a registered trademark of Amazon.com Inc."
  }
} as const;

export const polymorphicOptions = z.object({
  metamorphicCodeGeneration: z.boolean().default(true),
  dynamicAntiDebugging: z.boolean().default(true),
  controlFlowObfuscation: z.boolean().default(true),
  stringMutation: z.boolean().default(true),
  virtualMachine: z.boolean().default(true),
});

export type PolymorphicOptions = z.infer<typeof polymorphicOptions>;

export const obfuscationOptions = z.object({
  compact: z.boolean().default(true),
  controlFlowFlattening: z.boolean().default(true),
  deadCodeInjection: z.boolean().default(true),
  stringEncryption: z.boolean().default(true),
  rotateStringArray: z.boolean().default(true),
  selfDefending: z.boolean().default(false),
  renameGlobals: z.boolean().default(false),
  renameProperties: z.boolean().default(false),
  filePumpSizeMB: z.number().min(0).optional(),
  registry: registryOptions.optional(),
  polymorphic: polymorphicOptions.optional()
});

export type ObfuscationOptions = z.infer<typeof obfuscationOptions>;

export const binaryFiles = pgTable("binary_files", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  originalContent: text("original_content").notNull(),
  obfuscatedContent: text("obfuscated_content").notNull(),
  options: jsonb("options").notNull().$type<ObfuscationOptions>(),
  createdAt: text("created_at").notNull(),
});

export const insertBinaryFileSchema = createInsertSchema(binaryFiles, {
  fileName: z.string(),
  fileType: z.string(),
  originalContent: z.string(),
  options: obfuscationOptions,
  createdAt: z.string(),
}).omit({
  id: true,
  obfuscatedContent: true
});

export type InsertBinaryFile = z.infer<typeof insertBinaryFileSchema>;
export type BinaryFile = typeof binaryFiles.$inferSelect;

export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  originalCode: text("original_code").notNull(),
  obfuscatedCode: text("obfuscated_content").notNull(),
  options: jsonb("options").notNull().$type<ObfuscationOptions>(),
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets);
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;