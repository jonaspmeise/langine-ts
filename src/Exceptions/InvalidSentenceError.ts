export class InvalidSentenceError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static invalidNamedReference = (reference: string) => {
        return new InvalidSentenceError(`
        The Reference "${reference}" has an invalid Naming Schema.
        References should be constructed with the following pattern:
        
        <<Type@Name>>`);
    };

    public static duplicateNamedReferences = (text: string, duplicates: string[]) => {
        return new InvalidSentenceError(`
        The Rule "${text}" references Types which are ambigious due to duplicate names.
        The following Types have either the same Type without custom Names or the same custom Name:
        
        ${duplicates.join('\n\t')}
        
        Consider giving them unique Names.`);
    };
}