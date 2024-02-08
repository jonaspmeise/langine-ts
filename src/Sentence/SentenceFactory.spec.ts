import { expect } from "chai";
import { MixedSentence } from "./MixedSentence";
import { TypeSentence } from "./TypeSentence";
import { SimpleSentence } from "./SimpleSentence";
import { SentenceFactory } from "./SentenceFactory";

describe('Sentence Factory.', () => {
    describe('parse() works correctly.', () => {
        it('#1', () => {
            const text = 'This is a Sentence with <<Tokens>>';
            const sentence = SentenceFactory.parse(text) as MixedSentence;

            expect(sentence).to.be.instanceOf(MixedSentence);
            expect(sentence.getDefinition()).to.not.equal(text);
            expect(sentence.references).to.have.length(1);

            const reference = Array.from(sentence.references.values())[0];
            expect(reference.name).to.equal('Tokens');
            expect(reference.types).to.deep.include('Tokens');
        });

        it('#2', () => {
            const text = '<<TypeExample>>';
            const sentence = SentenceFactory.parse(text) as TypeSentence;

            expect(sentence).to.be.instanceOf(TypeSentence);
            expect(sentence.getDefinition()).to.not.equal(text);
            expect(Array.from(sentence.references.values())[0].name).to.equal('TypeExample');
            expect(Array.from(sentence.references.values())[0].types).to.deep.include('TypeExample');
        });

        it('#3', () => {
            const text = 'This is a very simple Sentence without any Tokens!';
            const sentence = SentenceFactory.parse(text) as SimpleSentence;

            expect(sentence).to.be.instanceOf(SimpleSentence);
            expect(sentence.getDefinition()).to.equal(text);
        });

        it('#4', () => {
            const text = '<<TypeExample@SomeName>>';
            const sentence = SentenceFactory.parse(text) as TypeSentence;

            expect(sentence).to.be.instanceOf(TypeSentence);
            expect(sentence.getDefinition()).to.not.equal(text);
            expect(Array.from(sentence.references.values())[0].name).to.equal('SomeName');
            expect(Array.from(sentence.references.values())[0].types).to.include('TypeExample');
        });

    });
});