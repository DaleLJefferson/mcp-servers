import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  // Helper function for shared git add logic
  const gitAdd = async (repoPath: string, files: string[]) => {
    const git = simpleGit(repoPath);
    await git.add(files);
    return textResponse("Success");
  };

  // Add specific files
  server.tool(
    "add",
    "git add <files>",
    {
      repoPath,
      files: z.array(z.string()).describe("The files to add"),
    },
    async ({ repoPath, files }) => gitAdd(repoPath, files)
  );

  // Add all files
  server.tool(
    "add_all",
    "git add .",
    {
      repoPath,
    },
    async ({ repoPath }) => gitAdd(repoPath, ["."])
  );
};
