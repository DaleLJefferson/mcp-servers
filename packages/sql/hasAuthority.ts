import { Parser } from "node-sql-parser";

export enum QueryType {
    SELECT = "select",
}

export function hasAuthority(sql: string, queryType: QueryType): boolean {
    if (sql.trim() === "") {
        return false;
    }

    const parser = new Parser();

    try {
        const error = parser.whiteListCheck(sql, [`${queryType}::(.*):(.*)`], { type: 'table' });

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        return false;
    }
}
