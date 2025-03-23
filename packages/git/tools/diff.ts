import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "diff",
    "git diff --staged",
    {
      repoPath,
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      const diff = await git.diff(["--staged"]);

      return textResponse(diff ?? "No changes detected");
    }
  );
};
