export class InvalidReferenceError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static wrongFormat = (definition: string): InvalidReferenceError => {
        return new InvalidReferenceError(`
        "<<${definition}>>" is not a valid Reference definition!
        A reference has to have one of the following naming schemas:

        <<TYPE>>
        <<TYPE@NAME>>
        `);
    };

    public static invalidSymbols = (definition: string): InvalidReferenceError => {
        return new InvalidReferenceError(`
        A reference name and types may not have invalid symbols!
        
        ${definition}

        Only lowercase/uppercase letters, numbers and "_" are allowed!
        `);
    };

    public static noTypes = (): InvalidReferenceError => {
        return new InvalidReferenceError(`
        A reference can not have an empty type! You probably passed an array of nothing to it.
        `);
    };

    public static duplicateNamedReference = (text: string, duplicates: string[]): InvalidReferenceError => {
        return new InvalidReferenceError(`
        The sentence "${text}" has References that have duplicate names:

        ${duplicates.join('\n\t')}
        `);
    };
}