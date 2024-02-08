import { Sentence } from "../Sentence/Sentence";

export class ParsingError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static couldNotBeParsed = (sentence: Sentence): ParsingError => {
        return new ParsingError(`
            There is no rule which can be applied to the following sentence:

            ${sentence.getDefinition()}

            ${sentence.references.size > 0
                ? Array.from(sentence.references.values()).map((reference) => {
                    return `[${Array.from(reference.types).join(',')}]@${reference.name}`
                }).join('\n\t')
                : ''}
        `);
    };
}