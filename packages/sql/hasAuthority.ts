import { Parser } from "node-sql-parser";

export enum QueryType {
    SELECT = "select",
}

const EXPLAIN_ANALYZE = 'explain analyze';

export function hasAuthority(sql: string, queryType: QueryType): boolean {
    const parser = new Parser();

    try {
        // Handle EXPLAIN ANALYZE queries for SELECT authority
        let queryToCheck = sql;
        
        if (queryType === QueryType.SELECT && 
            sql.trim().toLowerCase().startsWith(EXPLAIN_ANALYZE)) {
            // Simply remove EXPLAIN ANALYZE prefix and continue with normal logic
            queryToCheck = sql.trim().substring(EXPLAIN_ANALYZE.length).trim();
        }

        const {tableList, ast} = parser.parse(queryToCheck, {database: "postgresql"});

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
