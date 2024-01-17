export class InvalidGrammarError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static noRulesFound = (regex: string | undefined): InvalidGrammarError => {
        return new InvalidGrammarError(`
        No rules were found!
        
        ${(!!regex) ? `The custom Regex you supplied was unable to find any matches: "${regex}"!`: ''}`);
    }
}