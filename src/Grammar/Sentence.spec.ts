import { expect } from "chai";
import { Sentence } from "./Sentence";
import { InvalidSentenceError } from "../Exceptions/InvalidSentenceError";

describe('Sentences.', () => {
    it('Simple Sentences can be instantiated.', () => {
        const sentence = new Sentence('Player');

        expect(sentence.references).to.be.empty;
        expect(sentence.text).to.deep.equal('Player');
        expect(sentence.isSimpleSentence()).to.be.true;
        expect(sentence.isTypeSentence()).to.be.false;
        expect(sentence.isMixedSentence()).to.be.false;
    });

    it('Type Sentences can be instantiated.', () => {
        const sentence = new Sentence('<<Consists>>');

        expect(sentence.references).to.have.keys('Consists');
        expect(sentence.text).to.deep.equal('<<Consists>>');
        expect(sentence.isSimpleSentence()).to.be.false;
        expect(sentence.isTypeSentence()).to.be.true;
        expect(sentence.isMixedSentence()).to.be.false;
    });

    it('Mixed Sentences can be instantiated.', () => {
        const sentence = new Sentence('<<Component>> <<destroys>> <<Entity>>');

        expect(sentence.references).to.have.keys('Component', 'destroys', 'Entity');
        expect(sentence.text).to.deep.equal('<<Component>> <<destroys>> <<Entity>>');
        expect(sentence.isSimpleSentence()).to.be.false;
        expect(sentence.isTypeSentence()).to.be.false;
        expect(sentence.isMixedSentence()).to.be.true;
    });

    it('Mixed Sentences with named References can be instantiated.', () => {
        const sentence = new Sentence('<<Component@A>> <<consists>> <<Component@B>>');

        expect(sentence.references).to.have.keys('A', 'consists', 'B');
        expect(sentence.text).to.deep.equal('<<Component@A>> <<consists>> <<Component@B>>');
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

    it('The query Regex of a simple Sentence is constructed correctly.', () => {
        const sentence = new Sentence('consists out of ??');
        
        expect(sentence.matchRegex).to.deep.equal(new RegExp('consists out of \\?\\?', 'g'));
    });

    it('Named References in a Sentence are translated correctly into RegEx.', () => {
        const sentence = new Sentence('<<Entity@A>> consists out of <<Component@B>>');

        expect(sentence.matchRegex).to.deep.equal(new RegExp('<<(?<A>Entity)>> consists out of <<(?<B>Component)>>', 'g'));
    });
});