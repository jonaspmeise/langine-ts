export class InvalidGrammarError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static wrongRuleFormat = (line: string): InvalidGrammarError => {
        return new InvalidGrammarError(`
        The line

        ${line}

        could not be parsed correctly, because it has a wrong rule format.
        All provided grammar rules should adhere to the following format:

        [INPUT SENTENCE] -> [OUTPUT SENTENCE]
        `);
    }
}