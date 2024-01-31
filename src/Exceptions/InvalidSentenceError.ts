import { Token, TokenId } from "../Grammar/Token";

export class InvalidSentenceError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static invalidNamedReference = (reference: string): InvalidSentenceError => {
        return new InvalidSentenceError(`
        The Reference "${reference}" has an invalid Naming Schema.
        References should be constructed with the following pattern:
        
        <<Type@Name>>`);
    };

    public static duplicateNamedReferences = (text: string, duplicates: Token[]): InvalidSentenceError => {
        return new InvalidSentenceError(`
        The Rule "${text}" references Types which are ambigious due to duplicate names.
        The following Types have either the same Type without custom Names or the same custom Name:
        
        ${duplicates.map((token) => `${Array.from(token.types)[0]}@${token.name}`).join('\n\t')}
        
        Consider giving them unique Names.`);
    };

    public static inactiveReference = (text: string, references: TokenId[]): InvalidSentenceError => {
        return new InvalidSentenceError(`
        The Sentence "${text}" does not use the provided Token at all. Consider adjusting your Token-Map that you pass along:

        ${references.join('\n\t')}
        `);
    };
}