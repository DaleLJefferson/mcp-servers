import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";
import { z } from "zod";

export default (server: McpServer) => {
  server.tool(
    "diff",
    "git diff [args]",
    {
      repoPath,
      args: z
        .array(z.string())
        .optional()
        .describe("The arguments to pass to git diff"),
    },
    async ({ repoPath, args }) => {
      const git = simpleGit(repoPath);

      const diff = await git.diff(args);

      return textResponse(diff || "No changes detected");
    }
  );
};
