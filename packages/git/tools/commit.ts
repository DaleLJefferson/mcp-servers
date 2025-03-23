import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "commit",
    "git commit -m <message>",
    {
      repoPath,
      message: z.string().describe("The commit message"),
    },
    async ({ repoPath, message }) => {
      const git = simpleGit(repoPath);

      await git.commit(message);

      return textResponse("Success");
    }
  );
};
