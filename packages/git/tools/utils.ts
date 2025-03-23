import { z } from "zod";

// Shared parameter definition for git tools
export const repoPath = z
  .string()
  .describe("The absolute path to the git repository");

// Helper function to create a simple text response
export const textResponse = (text: string) => ({
  content: [{ type: "text" as const, text }],
});
