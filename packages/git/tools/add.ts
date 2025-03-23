import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  // Helper function for shared git add logic
  const gitAdd = async (repoPath: string, files: string[]) => {
    const git = simpleGit(repoPath);
    await git.add(files);
    return {
      content: [{ type: "text" as const, text: "Success" }],
    };
  };

  // Add specific files
  server.tool(
    "add",
    "git add <files>",
    {
      repoPath: z.string().describe("The absolute path to the git repository"),
      files: z.array(z.string()).describe("The files to add"),
    },
    async ({ repoPath, files }) => gitAdd(repoPath, files)
  );

  // Add all files
  server.tool(
    "add_all",
    "git add .",
    {
      repoPath: z.string().describe("The absolute path to the git repository"),
    },
    async ({ repoPath }) => gitAdd(repoPath, ["."])
  );
};
