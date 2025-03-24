import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { simpleGit } from "simple-git";
import { z } from "zod";

const repoPath = z.string().describe("The absolute path to the git repository");

const textResponse = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

const server = new McpServer({
  name: "Git",
  version: "1.0.0",
});

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

    return textResponse(files.length > 0 ? files : "None");
  }
);

server.tool(
  "add",
  "git add <files>",
  {
    repoPath,
    files: z.array(z.string()).describe("Relative paths to files to add"),
  },
  async ({ repoPath, files }) => {
    const git = simpleGit(repoPath);
    await git.add(files);
    return textResponse("Success");
  }
);

server.tool(
  "add_all",
  "git add .",
  {
    repoPath,
  },
  async ({ repoPath }) => {
    const git = simpleGit(repoPath);
    await git.add(".");
    return textResponse("Success");
  }
);

server.tool(
  "commit_staged",
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

server.tool(
  "diff",
  "git diff",
  {
    repoPath,
  },
  async ({ repoPath }) => {
    const git = simpleGit(repoPath);

    const diff = await git.diff();

    return textResponse(diff || "None");
  }
);

server.tool(
  "diff_staged",
  "git diff --staged",
  {
    repoPath,
  },
  async ({ repoPath }) => {
    const git = simpleGit(repoPath);

    const diff = await git.diff(["--staged"]);

    return textResponse(diff || "None");
  }
);

server.tool(
  "current_branch",
  "git branch --show-current",
  {
    repoPath,
  },
  async ({ repoPath }) => {
    const git = simpleGit(repoPath);

    const branch = await git.branch();

    return textResponse(branch.current);
  }
);

server.tool(
  "create_branch",
  "git branch <name>",
  {
    repoPath,
    name: z.string().describe("The name of the branch to create"),
  },
  async ({ repoPath, name }) => {
    const git = simpleGit(repoPath);

    await git.branch([name]);

    return textResponse(`Branch '${name}' created successfully`);
  }
);

server.tool(
  "checkout_branch",
  "git checkout <name>",
  {
    repoPath,
    name: z.string().describe("The name of the branch to checkout"),
  },
  async ({ repoPath, name }) => {
    const git = simpleGit(repoPath);

    await git.checkout(name);

    return textResponse(`Switched to branch '${name}'`);
  }
);

await server.connect(new StdioServerTransport());
