import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "push",
    "git push [remote] [branch]",
    {
      repoPath: z.string(),
      remote: z.string().optional(),
      branch: z.string().optional(),
    },
    async ({ repoPath, remote, branch }) => {
      const git = simpleGit(repoPath);

      await git.push(remote, branch);

      return {
        content: [{ type: "text" as const, text: "Push successful" }],
      };
    }
  );
};
