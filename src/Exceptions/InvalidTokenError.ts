export class InvalidTokenError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static invalidNamedReference = (reference: string) => {
        return new InvalidTokenError(`
        The Reference "${reference}" has an invalid Naming Schema.
        Tokens should be named with the following pattern:
        
        <<Type@Name>>`);
    };

    public static duplicateNamedReferences = (text: string, duplicates: string[]) => {
        return new InvalidTokenError(`
        The Rule "${text}" references Types which are ambigious due to duplicate names.
        The following Types have either the same Type without custom Names or the same custom Name:
        
        ${duplicates.join('\n\t')}
        
        Consider giving them unique Names.`);
    };
}