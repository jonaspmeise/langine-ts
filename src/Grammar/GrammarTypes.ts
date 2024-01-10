import { DefaultLogger } from "../Logger/DefaultLogger";
import { Logger } from "../Logger/Logger";

export type GrammarOptions = {
    logger: Logger,
    referenceExtractor: ReferenceExtractor,
    caseSensitive: boolean
};

export type ReferenceExtractor = {
    //parses references from a grammar rule
    parse: (ruleDefinition: string) => string[] | null,
    //reconstructs the found reference from the reference
    reconstruct: (originalReference: string) => string;
}

export const defaultGrammarOptions: GrammarOptions = {
    logger: new DefaultLogger(),
    referenceExtractor: {
        parse: (ruleDefinition: string) => ruleDefinition.match(new RegExp(`(?<=<<).+?(?=>>)`, 'gm')) ?? [],
        reconstruct: (originalReference: string) => `<<${originalReference}>>`
    },
    caseSensitive: false
}

export const injectWithDefaultValues = (customOptions?: Partial<GrammarOptions>): GrammarOptions => {
    return Object.assign({}, defaultGrammarOptions, customOptions);
}