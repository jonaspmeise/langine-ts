import { IdGenerator, defaultIdGenerator } from "../ECS/Types";

export class Token {
    public readonly types: Set<string>;

    constructor(
        //The Types, that this Token has.
        types: Set<string> | string[], 
        //The Name, which is being used to find the correct Parameters when applying parsed Tokens to Functions.
        public readonly name: string, 
        idGenerator: IdGenerator = defaultIdGenerator,
        //The internal ID, which is used to discern between different Tokens.
        public readonly id = idGenerator()) {
            Array.isArray(types) ? this.types = new Set(types) : this.types = types;
    }
}

export type TokenId = string;