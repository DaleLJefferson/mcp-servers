import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "add",
    "git add <files>",
    {
      repoPath,
      files: z.array(z.string()).describe("The files to add, use . for all"),
    },
    async ({ repoPath, files }) => {
      const git = simpleGit(repoPath);
      await git.add(files);
      return textResponse("Success");
    }
  );
};
