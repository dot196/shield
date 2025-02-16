import { type CodeSnippet, type InsertCodeSnippet } from "@shared/schema";

export interface IStorage {
  saveCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  getCodeSnippet(id: number): Promise<CodeSnippet | undefined>;
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

export const storage = new MemStorage();
