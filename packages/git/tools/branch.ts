import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "current_branch",
    "git branch --show-current",
    {
      repoPath,
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      const { current } = await git.status();

      return textResponse(current ?? "No branch");
    }
  );
};
