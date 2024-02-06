import { expect } from "chai";
import { MixedSentence } from "./MixedSentence";
import { InvalidSentenceError } from "../Error/InvalidSentenceError";

describe('Mixed Sentences.', () => {
    it('Need to have references in their definition.', () => {
        expect(() => new MixedSentence('Some definition without references, surprisingly.')).to.throw(InvalidSentenceError);
    });

    it('Need to have normal Tokens in their definition.', () => {
        expect(() => new MixedSentence('<<Reference>>')).to.throw(InvalidSentenceError);
    });

    it('References are automatically created and injected into a Mixed Sentence.', () => {
        const text = 'This is a wrong sentence, since it has a <<testId@abc123>> and another <<testId@def456>>. How confusing!';
        const sentence = new MixedSentence(text);

        expect(sentence.definition).to.not.equal(text);
        expect(sentence.references).to.have.length(2);
    });
});