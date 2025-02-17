import { type CodeSnippet, type InsertCodeSnippet } from "@shared/schema";
import { type BinaryFile, type InsertBinaryFile } from "@shared/schema";
import { type AuthCode, type InsertAuthCode } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { binaryFiles, codeSnippets, authCodes } from "@shared/schema";
import crypto from 'crypto';

export interface IStorage {
  saveCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  getCodeSnippet(id: number): Promise<CodeSnippet | undefined>;
}

export interface IBinaryStorage {
  saveBinaryFile(file: InsertBinaryFile): Promise<BinaryFile>;
  getBinaryFile(id: number): Promise<BinaryFile | undefined>;
}

export interface IAuthStorage {
  generateAuthCode(): Promise<string>;
  validateAuthCode(code: string): Promise<boolean>;
  markCodeAsUsed(code: string): Promise<void>;
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

export class DatabaseAuthStorage implements IAuthStorage {
  async generateAuthCode(): Promise<string> {
    // Generate a 16-character code using crypto
    const code = crypto.randomBytes(8).toString('hex');

    await db.insert(authCodes).values({
      code,
      used: false,
      createdAt: new Date().toISOString()
    });

    return code;
  }

  async validateAuthCode(code: string): Promise<boolean> {
    const [authCode] = await db
      .select()
      .from(authCodes)
      .where(eq(authCodes.code, code));

    return authCode && !authCode.used;
  }

  async markCodeAsUsed(code: string): Promise<void> {
    await db
      .update(authCodes)
      .set({ 
        used: true,
        usedAt: new Date().toISOString()
      })
      .where(eq(authCodes.code, code));
  }
}

export const storage = new DatabaseStorage();
export const binaryStorage = new DatabaseBinaryStorage();
export const authStorage = new DatabaseAuthStorage();