import { SentenceError } from "../Error/SentenceError";
import { Reference, References } from "../Reference/Reference";
import { Sentence } from "./Sentence";

export class MixedSentence extends Sentence {
    constructor(definition: string) {
        const foundReferences = Reference.parseReferences(definition);

        //Are there references?
        if(foundReferences === undefined) throw SentenceError.mixedWithoutReferences(definition);

        //Update the text to represent the "rendered" References
        super(MixedSentence.injectReferences(definition, foundReferences), foundReferences);

        //Are there normal tokens?
        if(!Sentence.hasNormalTokens(definition)) throw SentenceError.mixedWithoutNormalText(definition);
    }

    private static injectReferences = (definition: string, references: References): string => {
        let text = definition;

        Array.from(references.values()).forEach((reference) => {
            text = text.replace(`<<${reference.definition}>>`, reference.toRenderString());
        });

        return text;
    };
}