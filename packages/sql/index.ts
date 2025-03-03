import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { executeRdsSql, type Config } from "./executeRdsSql.js";

// Check if all required development config values are present
const devConfig: Config | null = (
    process.env.MCP_SQL_DEV_PROFILE &&
    process.env.MCP_SQL_DEV_RESOURCE_ARN &&
    process.env.MCP_SQL_DEV_SECRET_ARN &&
    process.env.MCP_SQL_DEV_DATABASE
) ? {
    profile: process.env.MCP_SQL_DEV_PROFILE,
    resourceArn: process.env.MCP_SQL_DEV_RESOURCE_ARN,
    secretArn: process.env.MCP_SQL_DEV_SECRET_ARN,
    database: process.env.MCP_SQL_DEV_DATABASE
} : null;

// Check if all required production config values are present
const prodConfig: Config | null = (
    process.env.MCP_SQL_PROD_PROFILE &&
    process.env.MCP_SQL_PROD_RESOURCE_ARN &&
    process.env.MCP_SQL_PROD_SECRET_ARN &&
    process.env.MCP_SQL_PROD_DATABASE
) ? {
    profile: process.env.MCP_SQL_PROD_PROFILE,
    resourceArn: process.env.MCP_SQL_PROD_RESOURCE_ARN,
    secretArn: process.env.MCP_SQL_PROD_SECRET_ARN,
    database: process.env.MCP_SQL_PROD_DATABASE
} : null;

const server = new McpServer({
    name: "sql",
    version: "1.0.0"
}, {
    instructions: "This is a SQL server. Use the correct environment and method",
});

// Conditionally register development tool if dev config exists
if (devConfig) {
    server.tool(
        "dev_select",
        "Perform a select query in the development database",
        { sql: z.string() },
        async ({ sql: query }) => {
            try {
                const results = await executeRdsSql(devConfig, query);

                return {
                    content: [{ type: "text", text: results || "No results returned" }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error executing SQL: ${error instanceof Error ? error.message : String(error)}` }]
                };
            }
        }
    );
}

// Conditionally register production tool if prod config exists
if (prodConfig) {
    server.tool(
        "prod_select",
        "Perform a select query in the production database",
        { sql: z.string() },
        async ({ sql: query }) => {
            try {
                const results = await executeRdsSql(prodConfig, query);

                return {
                    content: [{ type: "text", text: results || "No results returned" }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error executing SQL: ${error instanceof Error ? error.message : String(error)}` }]
                };
            }
        }
    );
}

await server.connect(new StdioServerTransport()); 