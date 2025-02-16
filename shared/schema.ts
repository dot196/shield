import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  originalCode: text("original_code").notNull(),
  obfuscatedCode: text("obfuscated_code").notNull(),
  options: jsonb("options").notNull().$type<ObfuscationOptions>(),
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets);
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;
