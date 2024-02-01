import { IdGenerator, defaultIdGenerator } from "../ECS/Types";
import { disjunction } from "../Util";

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

    //Two Tokens are identical if they have the same name and share all Types.
    //The ID of an Token does not matter, since it is only a Reference.
    public equals = (token: Token): boolean => {
        return (this.name === token.name
            && disjunction(this.types, token.types).size === 0)
    }
}

export type TokenId = string;