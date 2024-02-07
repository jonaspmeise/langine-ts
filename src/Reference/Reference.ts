import { InvalidReferenceError } from "../Error/InvalidReferenceError";
import { findDuplicates } from "../Util";

export class Reference {
    constructor(
        public readonly name: string,
        public readonly types: string[],
        public readonly definition: string,
        public readonly id: ReferenceId = generateId()
    ) {
        const validNameRegex = new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');

        if(!validNameRegex.test(name)) throw InvalidReferenceError.invalidSymbols(name);

        if(types.length === 0) throw InvalidReferenceError.noTypes();
        const invalidType = types.find((singleType) => !(validNameRegex.test(singleType)));

        if(invalidType !== undefined) throw InvalidReferenceError.invalidSymbols(invalidType);
    }

    public toRenderString = (): string => {
        return `<<${this.id}>>`;
    };

    public static parseReferences = (text: string): References | undefined => {
        const matches = text.match(new RegExp('(?<=<<).+?(?=>>)', 'g'));

        //We might not have any References in this text!
        if(matches === null) return undefined;

        const references = matches.map((match) => Reference.from(match));

        //There shall be no References that have the same name. These would cause errors when evaluating Functions.
        const duplicateNamedReferences = findDuplicates(references.map((reference) => reference.name));
        if(duplicateNamedReferences.length > 0) throw InvalidReferenceError.duplicateNamedReference(text, duplicateNamedReferences); 

        return new Map(references.map((reference) => [reference.id, reference]));
    };

    public static from = (definition: string): Reference => {
        //Do we have a named Token?
        const nameTypeSplit = definition.split('@');
        
        //Default case
        if(nameTypeSplit.length === 1) return new Reference(definition, [definition], definition);

        //This is nonsense, because the second '@' has no meaning!
        if(nameTypeSplit.length > 2) throw InvalidReferenceError.wrongFormat(definition);

        //A custom name was given: TYPE@NAME
        return new Reference(nameTypeSplit[1], [nameTypeSplit[0]], definition);
    };
}

export const generateId = (length: number = 32): ReferenceId => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let uuid = '';

    for (let i = 0; i < length; i++) {
        uuid += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    return uuid;
};

export type ReferenceId = string;

export type References = Map<ReferenceId, Reference>;