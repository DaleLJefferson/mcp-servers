import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "current_branch",
    "git branch --show-current",
    {
      repoPath: z.string().describe("The absolute path to the git repository"),
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      const { current } = await git.status();

      return {
        content: [{ type: "text", text: current ?? "No branch" }],
      };
    }
  );
};
