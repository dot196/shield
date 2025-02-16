import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fileTypes = ['exe', 'msi', 'bat', 'js', 'ico'] as const;
export type FileType = typeof fileTypes[number];

export const obfuscationOptions = z.object({
  compact: z.boolean().default(true),
  controlFlowFlattening: z.boolean().default(true),
  deadCodeInjection: z.boolean().default(true),
  stringEncryption: z.boolean().default(true),
  rotateStringArray: z.boolean().default(true),
  selfDefending: z.boolean().default(false),
  renameGlobals: z.boolean().default(false),
  renameProperties: z.boolean().default(false)
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
  originalContent: z.instanceof(Buffer),
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
  obfuscatedCode: text("obfuscated_code").notNull(),
  options: jsonb("options").notNull().$type<ObfuscationOptions>(),
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets);
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;