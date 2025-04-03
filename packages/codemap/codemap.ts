import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { globby } from "globby";
import Path from "path";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"];

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

type Tree = {
  [key: string]: Tree;
};

function formatFilesContent(path: string, content: string): string {
  return `<file path="${path}">\n${content}\n</file>`;
}

function createTree(paths: string[]): Tree {
  const tree: Tree = {};

  paths.forEach((path) => {
    const parts = path.split("/").filter((part) => part !== "");
    let current = tree;
    parts.forEach((part) => {
      // Ensure current[part] is defined before proceeding
      current[part] = current[part] || {};
      current = current[part];
    });
  });

  return tree;
}

function printTree(tree: Tree, indent: string = ""): string {
  if (Object.keys(tree).length === 0) {
    return "";
  }
  let result = "";
  Object.keys(tree)
    .sort()
    .forEach((key) => {
      result += `${indent}${key}\n`;
      result += printTree(tree[key] ?? {}, indent + "  ");
    });
  return result;
}

type FileData = {
  path: string;
  lastModified: number;
  content: string;
};

async function getFilesData(
  cwd: string,
  include: Array<string>,
  ignore: Array<string> = []
): Promise<Array<FileData>> {
  if (include.length === 0) {
    return [];
  }

  const files = await globby(include, {
    gitignore: true,
    ignore,
    followSymbolicLinks: false,
    cwd,
  }).then((files) => files.sort());

  return await Promise.all(
    files.map(async (path: string) => {
      const file = Bun.file(Path.join(cwd, path));
      const [content, lastModified] = await Promise.all([
        file.text().then((content) => formatFilesContent(path, content)),
        file.lastModified,
      ]);
      return {
        path,
        lastModified,
        content,
      };
    })
  );
}

const textResponse = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

const server = new McpServer({
  name: "codemap",
  version: "1.0.0",
});

server.tool(
  "create_plan",
  "Create a plan for a users request, always present the plan to the user to confirm before proceeding",
  {
    request: z.string(),
    projectAbsolutePath: z.string(),
  },
  async ({ request, projectAbsolutePath }) => {
    const filesData = await getFilesData(
      projectAbsolutePath,
      ["**"],
      ["*.lock"]
    );

    const tree = createTree(filesData.map((fileData) => fileData.path));

    const fileTreeText = `<file_tree>\n${printTree(tree)}\n</file_tree>`;
    const filesText = `<files>\n${filesData
      .map(({ content }) => content)
      .join("\n")}\n</files>`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-exp-03-25",
      config: {
        temperature: 0,
        systemInstruction: `You are an AI assistant specialized in software architecture.

- You will respond with a detailed implementation plan not for the user but for another AI assistant who will implement the plan.
- The AI assistant is a specialist software developer, their coding skills are superiour to yours, but they and will have no knowledge of the codebase or requirements other than what you provide, and lack the software architecture skills you have.
- Start the plan with a comprehensive and detailed overview "Goal" of what needs to be done and how the AI assistant will know when it is complete (Acceptance Criteria).
- Always include a file tree with a description of each file.
- Provide all the context they need to successfully complete the plan. Include requirements details, key rules, design decisions, important functions, structs, interfaces, and any other information you have that will help them complete the plan and prevent them from making mistakes.
- Break the plan into named steps with descriptions of what needs to be done, provide all the information needed to complete the step.
- When including code use markdown code blocks with the language specified, and try to avoid full file content, only include the code that is changing or needs to be changed.
        `,
      },
      contents: [fileTreeText, filesText, request],
    });

    const result = {
      plan: response.text ?? "No plan",
      fileTreeText,
      useage: response.usageMetadata,
    };

    return textResponse(JSON.stringify(result));
  }
);

await server.connect(new StdioServerTransport());
