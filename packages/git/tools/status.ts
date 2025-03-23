import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { repoPath, textResponse } from "./utils.js";
import { simpleGit } from "simple-git";

export default (server: McpServer) => {
  server.tool(
    "status",
    "git status --short",
    {
      repoPath,
    },
    async ({ repoPath }) => {
      const git = simpleGit(repoPath);

      const status = await git.status();

      const files = status.files
        .map(({ working_dir, path }) => {
          return `${working_dir} ${path}`;
        })
        .join("\n");

      return textResponse(files);
    }
  );
};
