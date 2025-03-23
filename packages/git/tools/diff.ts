import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "diff",
    "git diff",
    {
      repoPath,
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      const diff = await git.diff();

      return textResponse(diff ?? "No changes detected");
    }
  );
};
