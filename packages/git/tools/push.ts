import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "push",
    "git push",
    {
      repoPath,
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      await git.push();

      return textResponse("Success");
    }
  );
};
