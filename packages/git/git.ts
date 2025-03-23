import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import add from "./tools/add";
import commit from "./tools/commit";
import push from "./tools/push";
import status from "./tools/status";
import diff from "./tools/diff";

const server = new McpServer(
  {
    name: "Git",
    version: "1.0.0",
  },
  {
    instructions: `
Before adding files, use the status tool to check if there are any unexpected changes.
Before using the diff tool, use the status tool so you know to diff staged or unstaged changes.
Before committing, use the diff tool to review changes first.
`,
  }
);

// Register all tools
status(server);
add(server);
commit(server);
push(server);
diff(server);

await server.connect(new StdioServerTransport());
