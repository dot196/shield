import { type CodeSnippet, type InsertCodeSnippet } from "@shared/schema";
import { type BinaryFile, type InsertBinaryFile } from "@shared/schema";

export interface IStorage {
  saveCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  getCodeSnippet(id: number): Promise<CodeSnippet | undefined>;
}

export interface IBinaryStorage {
  saveBinaryFile(file: InsertBinaryFile): Promise<BinaryFile>;
  getBinaryFile(id: number): Promise<BinaryFile | undefined>;
}

export class MemStorage implements IStorage {
  private snippets: Map<number, CodeSnippet>;
  private currentId: number;

  constructor() {
    this.snippets = new Map();
    this.currentId = 1;
  }

  async saveCodeSnippet(insertSnippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const id = this.currentId++;
    const snippet: CodeSnippet = { ...insertSnippet, id };
    this.snippets.set(id, snippet);
    return snippet;
  }

  async getCodeSnippet(id: number): Promise<CodeSnippet | undefined> {
    return this.snippets.get(id);
  }
}

export class MemBinaryStorage implements IBinaryStorage {
  private files: Map<number, BinaryFile>;
  private currentId: number;

  constructor() {
    this.files = new Map();
    this.currentId = 1;
  }

  async saveBinaryFile(insertFile: InsertBinaryFile): Promise<BinaryFile> {
    const id = this.currentId++;
    const file: BinaryFile = {
      id,
      fileName: insertFile.fileName,
      fileType: insertFile.fileType,
      originalContent: insertFile.originalContent.toString('base64'),
      obfuscatedContent: Buffer.from([]).toString('base64'),
      options: insertFile.options,
      createdAt: insertFile.createdAt
    };
    this.files.set(id, file);
    return file;
  }

  async getBinaryFile(id: number): Promise<BinaryFile | undefined> {
    return this.files.get(id);
  }
}

export const storage = new MemStorage();
export const binaryStorage = new MemBinaryStorage();