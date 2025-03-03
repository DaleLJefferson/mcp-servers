import { fromSSO } from "@aws-sdk/credential-provider-sso";
import { RDSDataClient, ExecuteStatementCommand, RecordsFormatType } from "@aws-sdk/client-rds-data";

export type Config = {
    profile: string;
    resourceArn: string;
    secretArn: string;
    database: string;
}

export async function executeRdsSql({ profile, resourceArn, secretArn, database }: Config, sql: string): Promise<string | undefined> {
    const client = new RDSDataClient({ region: "eu-west-2", credentials: fromSSO({ profile }) });
    const command = new ExecuteStatementCommand({
        resourceArn,
        secretArn,
        database,
        sql,
        formatRecordsAs: RecordsFormatType.JSON
    });
    const { formattedRecords } = await client.send(command);

    return formattedRecords;
}