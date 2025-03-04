import { expect, test, describe } from "bun:test";
import { hasAuthority, QueryType } from "./hasAuthority";

describe("hasAuthority", () => {
    // SELECT query tests
    describe("SELECT queries", () => {
        test("should allow proper SELECT query", () => {
            const sql = "SELECT * FROM users";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(true);
        });

        test("should allow SELECT query with CTE", () => {
            const sql = "WITH active_users AS (SELECT * FROM users WHERE status = 'active') SELECT * FROM active_users";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(true);
        });

        test("should reject improper SELECT query", () => {
            const sql = "INSERT INTO users (name) VALUES ('test')";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject UPDATE query when checking for SELECT", () => {
            const sql = "UPDATE users SET name = 'test' WHERE id = 1";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject DELETE query when checking for SELECT", () => {
            const sql = "DELETE FROM users WHERE id = 1";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject DROP query when checking for SELECT", () => {
            const sql = "DROP TABLE users";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject TRUNCATE query when checking for SELECT", () => {
            const sql = "TRUNCATE TABLE users";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject ALTER query when checking for SELECT", () => {
            const sql = "ALTER TABLE users ADD COLUMN email VARCHAR(255)";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject CREATE query when checking for SELECT", () => {
            const sql = "CREATE TABLE new_users (id INT, name VARCHAR(255))";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject INSERT with subselect when checking for SELECT", () => {
            const sql = "INSERT INTO users (id, name, email) SELECT id, name, email FROM temp_users";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject INSERT with complex subselect when checking for SELECT", () => {
            const sql = "INSERT INTO stats (user_id, total_orders, total_spent) SELECT user_id, COUNT(*), SUM(total) FROM orders GROUP BY user_id";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject INSERT with CTE when checking for SELECT", () => {
            const sql = "WITH new_users AS (SELECT id, name, email FROM temp_users WHERE status = 'active') INSERT INTO users (id, name, email) SELECT id, name, email FROM new_users";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject disguised INSERT with nested subselect when checking for SELECT", () => {
            const sql = "INSERT INTO users (id, name, email) SELECT id, name, (SELECT email FROM temp_emails WHERE user_id = temp_users.id LIMIT 1) FROM temp_users";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });

        test("should reject multi-statement injection with semicolon", () => {
            const sql = "SELECT * FROM users WHERE id = 1; DROP TABLE users;";
            expect(hasAuthority(sql, QueryType.SELECT)).toBe(false);
        });
    });
});
