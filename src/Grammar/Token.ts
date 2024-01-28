import { IdGenerator, defaultIdGenerator } from "../ECS/Types";

export class Token {
    public readonly id: string;
    
    constructor(
        public readonly type: string, 
        public readonly name: string = type, 
        idGenerator: IdGenerator = defaultIdGenerator) {
            this.id = idGenerator();
    }
}

export type TokenId = string;