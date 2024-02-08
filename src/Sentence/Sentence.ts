import { References } from "../Reference/Reference";
import { escapeRegex } from "../Util";

export abstract class Sentence {
    constructor(private definition: string, public readonly references: References = new Map()) {};

    public static hasReferences = (text: string): boolean => {
        return new RegExp('(?<=<<).+?(?=>>)', 'g').test(text);
    };

    public static hasNormalTokens = (text: string): boolean => {
        return !(new RegExp('^(?:<<[^<>]+?>>)+$', 'gm').test(text));
    };

    //TODO: Write Tests for this!
    public getQuery = (): RegExp => {
        //we need to "erase" the IDs from all References
        let query = escapeRegex(this.definition);

        Array.from(this.references.values()).forEach((reference) => {
            query = query.replace(reference.toRenderString(), `<<(?<${reference.id}>[^>]+?)>>`)
        });

        return new RegExp(`(?=(${query}))`, 'gm');
    };

    public setDefinition = (definition: string): void => {
        //TODO: Write Tests for this! We should check whether potential references introduced in the new definition are already set
        this.definition = definition;
    };

    public getDefinition = (): string => {
        return this.definition;
    };
}