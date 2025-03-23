import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "status",
    "git status",
    {
      repoPath,
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      const status = await git.status();

      // Build a simplified status message using template string
      const statusText = `
Branch ${status.current}

Unstaged

${status.modified.join("\n")}

Untracked

${status.not_added.join("\n")}

Staged

${status.staged.join("\n")}
`;

      return textResponse(statusText);
    }
  );
};
