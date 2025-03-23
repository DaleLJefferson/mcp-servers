import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import branch from "./tools/branch";
import add from "./tools/add";
import commit from "./tools/commit";
import push from "./tools/push";

const server = new McpServer({
  name: "Git",
  version: "1.0.0",
});

// Register all tools
branch(server);
add(server);
commit(server);
push(server);

await server.connect(new StdioServerTransport());
