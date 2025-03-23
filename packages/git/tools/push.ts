import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "push",
    "git push",
    {
      repoPath: z.string(),
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      await git.push();

      return {
        content: [{ type: "text", text: "Success" }],
      };
    }
  );
};
