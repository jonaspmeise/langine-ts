import { UUID } from "crypto";

export interface ParsingResult {
    readonly text: string;
    readonly values: Map<UUID, unknown>;
};