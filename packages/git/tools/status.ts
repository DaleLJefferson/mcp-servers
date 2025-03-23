import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "status",
    "git status",
    {
      repoPath: z.string(),
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      const status = await git.status();

      // Build a simplified status message
      let statusText = `On branch ${status.current}\n\n`;

      // Unstaged changes
      statusText += "Unstaged\n\n";
      if (status.modified.length > 0) {
        statusText +=
          status.modified.map((file) => `${file}`).join("\n") + "\n";
      }
      statusText += "\n";

      // Untracked files
      statusText += "Untracked\n\n";
      if (status.not_added.length > 0) {
        statusText +=
          status.not_added.map((file) => `${file}`).join("\n") + "\n";
      }
      statusText += "\n";

      // Staged changes
      statusText += "Staged\n\n";
      if (status.staged.length > 0) {
        statusText += status.staged.map((file) => `${file}`).join("\n") + "\n";
      }

      return {
        content: [
          {
            type: "text" as const,
            text: statusText,
          },
        ],
      };
    }
  );
};
