export class ReferenceError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static wrongFormat = (definition: string): ReferenceError => {
        return new ReferenceError(`
        "<<${definition}>>" is not a valid Reference definition!
        A reference has to have one of the following naming schemas:

        <<TYPE>>
        <<TYPE@NAME>>
        `);
    };

    public static invalidSymbols = (definition: string): ReferenceError => {
        return new ReferenceError(`
        A reference name and types may not have invalid symbols!
        
        ${definition}

        Only lowercase/uppercase letters, numbers and "_" are allowed!
        `);
    };

    public static noTypes = (): ReferenceError => {
        return new ReferenceError(`
        A reference can not have an empty type! You probably passed an array of nothing to it.
        `);
    };

    public static duplicateNamedReference = (text: string, duplicates: string[]): ReferenceError => {
        return new ReferenceError(`
        The sentence "${text}" has References that have duplicate names:

        ${duplicates.join('\n\t')}
        `);
    };
}