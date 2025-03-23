import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import add from "./tools/add";
import commit from "./tools/commit";
import push from "./tools/push";
import status from "./tools/status";
import diff from "./tools/diff";

const server = new McpServer({
  name: "Git",
  version: "1.0.0",
});

// Register all tools
status(server);
add(server);
commit(server);
push(server);
diff(server);

await server.connect(new StdioServerTransport());
