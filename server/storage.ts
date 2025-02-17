import { type CodeSnippet, type InsertCodeSnippet } from "@shared/schema";
import { type BinaryFile, type InsertBinaryFile } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { binaryFiles, codeSnippets } from "@shared/schema";

export interface IStorage {
  saveCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  getCodeSnippet(id: number): Promise<CodeSnippet | undefined>;
}

export interface IBinaryStorage {
  saveBinaryFile(file: InsertBinaryFile): Promise<BinaryFile>;
  getBinaryFile(id: number): Promise<BinaryFile | undefined>;
}

export class DatabaseStorage implements IStorage {
  async saveCodeSnippet(insertSnippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const [snippet] = await db
      .insert(codeSnippets)
      .values(insertSnippet)
      .returning();
    return snippet;
  }

  async getCodeSnippet(id: number): Promise<CodeSnippet | undefined> {
    const [snippet] = await db
      .select()
      .from(codeSnippets)
      .where(eq(codeSnippets.id, id));
    return snippet;
  }
}

export class DatabaseBinaryStorage implements IBinaryStorage {
  async saveBinaryFile(insertFile: InsertBinaryFile): Promise<BinaryFile> {
    const [savedFile] = await db
      .insert(binaryFiles)
      .values({
        ...insertFile,
        obfuscatedContent: '' // Will be set during obfuscation
      })
      .returning();

    return savedFile;
  }

  async getBinaryFile(id: number): Promise<BinaryFile | undefined> {
    const [file] = await db
      .select()
      .from(binaryFiles)
      .where(eq(binaryFiles.id, id));
    return file;
  }
}

export const storage = new DatabaseStorage();
export const binaryStorage = new DatabaseBinaryStorage();