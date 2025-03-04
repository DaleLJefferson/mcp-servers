import { Parser } from "node-sql-parser";

export enum QueryType {
    SELECT = "select",
}

export function hasAuthority(sql: string, queryType: QueryType): boolean {
    const parser = new Parser();

    try {
        const {tableList, ast} = parser.parse(sql, {database: "postgresql"});

        // Check if the query is a multi-statement query
        if (Array.isArray(ast) && ast.length > 1) {
            return false;
        }

        const methods = new Set(tableList.map((table) => table.split(":")[0]));

        // Check if methods only contains the queryType and nothing else
        return methods.size === 1 && methods.has(queryType);
    } catch (error: unknown) {
        return false;
    }
}
