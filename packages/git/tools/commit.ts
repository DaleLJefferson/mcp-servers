import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "commit",
    "git commit -m <message>",
    {
      repoPath: z.string().describe("The absolute path to the git repository"),
      message: z.string().describe("The commit message"),
    },
    async ({ repoPath, message }) => {
      const git = simpleGit(repoPath);

      await git.commit(message);

      return {
        content: [{ type: "text", text: "Success" }],
      };
    }
  );
};
