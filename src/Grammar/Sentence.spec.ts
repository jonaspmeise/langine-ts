import { expect } from "chai";
import { Sentence } from "./Sentence";
import { InvalidSentenceError } from "../Exceptions/InvalidSentenceError";

describe('Sentences.', () => {
    it('Simple Sentences can be instantiated.', () => {
        const sentence = new Sentence('Player');

        expect(sentence.tokens).to.be.empty;
        expect(sentence.definition).to.deep.equal('Player');
        expect(sentence.isSimpleSentence()).to.be.true;
        expect(sentence.isTypeSentence()).to.be.false;
        expect(sentence.isMixedSentence()).to.be.false;
    });

    it('Type Sentences can be instantiated.', () => {
        const sentence = new Sentence('<<Consists>>');

        const registeredTokenNames = [...sentence.tokens.values()].map((token) => token.name);
        expect(registeredTokenNames).to.include('Consists');
        expect(sentence.isSimpleSentence()).to.be.false;
        expect(sentence.isTypeSentence()).to.be.true;
        expect(sentence.isMixedSentence()).to.be.false;
    });

    it('Mixed Sentences can be instantiated.', () => {
        const sentence = new Sentence('<<Component>> <<destroys>> <<Entity>>');

        const registeredTokenNames = [...sentence.tokens.values()].map((token) => token.name);
        expect(registeredTokenNames).to.include('Component');
        expect(registeredTokenNames).to.include('destroys');
        expect(registeredTokenNames).to.include('Entity');
        expect(sentence.isSimpleSentence()).to.be.false;
        expect(sentence.isTypeSentence()).to.be.false;
        expect(sentence.isMixedSentence()).to.be.true;
    });

    it('Mixed Sentences with named References can be instantiated.', () => {
        const sentence = new Sentence('<<Component@A>> <<consists>> <<Component@B>>');

        const registeredTokenNames = [...sentence.tokens.values()].map((token) => token.name);
        expect(registeredTokenNames).to.include('A');
        expect(registeredTokenNames).to.include('consists');
        expect(registeredTokenNames).to.include('B');
        expect(sentence.isSimpleSentence()).to.be.false;
        expect(sentence.isTypeSentence()).to.be.false;
        expect(sentence.isMixedSentence()).to.be.true;
    });

    it('Named Sentences with invalid Syntax are not allowed.', () => {
        expect(() => new Sentence('<<Component@A@B>>')).to.throw(InvalidSentenceError);
    });

    it('Types referenced in a Sentence need to be named uniquely.', () => {
        expect(() => new Sentence('<<Component>> consists out of <<Component>>')).to.throw(InvalidSentenceError);
    });

    it('Names referenced in a Sentence need to be named uniquely.', () => {
        expect(() => new Sentence('<<Entity@A>> consists out of <<Component@A>>')).to.throw(InvalidSentenceError);
    });
});