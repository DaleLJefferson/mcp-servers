import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "commit",
    "git commit -m <message>",
    {
      repoPath: z.string(),
      message: z.string(),
    },
    async ({ repoPath, message }) => {
      const git = simpleGit(repoPath);

      await git.commit(message);

      return {
        content: [{ type: "text" as const, text: "Commit successful" }],
      };
    }
  );
};
