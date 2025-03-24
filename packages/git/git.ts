import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { simpleGit } from "simple-git";
import { z } from "zod";

// Shared parameter definition for git tools
const repoPath = z.string().describe("The absolute path to the git repository");

// Helper function to create a simple text response
const textResponse = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

const server = new McpServer({
  name: "Git",
  version: "1.0.0",
});

// Register status tool
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

// Register add tool
server.tool(
  "add",
  "git add <files>",
  {
    repoPath,
    files: z.array(z.string()).describe("The files to add, use . for all"),
  },
  async ({ repoPath, files }) => {
    const git = simpleGit(repoPath);
    await git.add(files);
    return textResponse("Success");
  }
);

// Register commit tool
server.tool(
  "commit",
  "git commit -m <message>",
  {
    repoPath,
    message: z.string().describe("The commit message"),
    files: z
      .array(z.string())
      .optional()
      .describe("The files to commit, defaults to all staged"),
  },
  async ({ repoPath, message, files }) => {
    const git = simpleGit(repoPath);

    await git.commit(message, files);

    return textResponse("Success");
  }
);

// Register push tool
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

// Register diff tool
server.tool(
  "diff",
  "git diff [args]",
  {
    repoPath,
    args: z
      .array(z.string())
      .optional()
      .describe("The arguments to pass to git diff"),
  },
  async ({ repoPath, args }) => {
    const git = simpleGit(repoPath);

    const diff = await git.diff(args);

    return textResponse(diff || "No changes detected");
  }
);

await server.connect(new StdioServerTransport());
