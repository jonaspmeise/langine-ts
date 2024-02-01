import { expect } from "chai";
import { Sentence, SentenceType } from "./Sentence";
import { InvalidSentenceError } from "../Exceptions/InvalidSentenceError";
import { Token, TokenId } from "./Token";

describe('Sentences.', () => {
    it('Simple Sentences can be instantiated.', () => {
        const sentence = new Sentence('Player');

        expect(sentence.tokens).to.be.empty;
        expect(sentence.definition).to.deep.equal('Player');
        expect(sentence.getSentenceType()).to.deep.equal(SentenceType.simple);
    });

    it('Type Sentences can be instantiated.', () => {
        const sentence = new Sentence('<<Consists>>');

        const registeredTokenNames = [...sentence.tokens.values()].map((token) => token.name);
        expect(registeredTokenNames).to.include('Consists');
        expect(sentence.getSentenceType()).to.deep.equal(SentenceType.type);
    });

    it('Mixed Sentences can be instantiated.', () => {
        const sentence = new Sentence('<<Component>> <<destroys>> <<Entity>>');

        const registeredTokenNames = [...sentence.tokens.values()].map((token) => token.name);
        expect(registeredTokenNames).to.include('Component');
        expect(registeredTokenNames).to.include('destroys');
        expect(registeredTokenNames).to.include('Entity');
        expect(sentence.getSentenceType()).to.deep.equal(SentenceType.mixed);
    });

    it('Mixed Sentences with named References can be instantiated.', () => {
        const sentence = new Sentence('<<Component@A>> <<consists>> <<Component@B>>');

        const registeredTokenNames = [...sentence.tokens.values()].map((token) => token.name);
        expect(registeredTokenNames).to.include('A');
        expect(registeredTokenNames).to.include('consists');
        expect(registeredTokenNames).to.include('B');
        expect(sentence.getSentenceType()).to.deep.equal(SentenceType.mixed);
    });

    it('Named Sentences with invalid Syntax are not allowed.', () => {
        expect(() => new Sentence('<<Component@A@B>>')).to.throw(InvalidSentenceError);
    });

    it('Types referenced in a Sentence need to be named uniquely.', () => {
        expect(() => new Sentence('<<Component>> consists out of <<Component>>')).to.throw(InvalidSentenceError);
    });

    it('Named referenced in a Sentence need to be named uniquely.', () => {
        expect(() => new Sentence('<<Entity@A>> consists out of <<Component@A>>')).to.throw(InvalidSentenceError);
    });

    it('Named References are parsed correctly.', () => {
        const sentence = new Sentence('<<Component@A>>');

        expect(sentence.tokens).to.have.length(1);

        const token = [...sentence.tokens.values()][0];
        expect(token.name).to.equal('A');
        expect(token.types).to.deep.include('Component');
    });

    it('Duplicate References with identical Names are not allowed.', () => {
        expect(() => new Sentence('<<Something@A>> and <<Something@A>>')).to.throw(InvalidSentenceError);
    });

    it('Tokens that are already defined are kept around.', () => {
        const tokenMap = new Map<TokenId, Token>();
        tokenMap.set('id12345', new Token(['Test'], 'Test-Token-Name',  () => 'id12345'))

        const sentence = new Sentence('Test something <<id12345>>', tokenMap);
        expect(sentence.tokens).to.have.length(1);
        expect(sentence.tokens).to.have.key('id12345');
        
        const token = sentence.tokens.get('id12345')!;
        expect(token).to.not.be.undefined;
        expect(token.id).to.equal('id12345');
        expect(token.name).to.equal('Test-Token-Name');
        expect(token.types).to.deep.include('Test');
    });

    it('Reference Tokens that are passed along into a Sentence have to appear in that Sentence.', () => {
        const tokenMap = new Map<TokenId, Token>();
        tokenMap.set('does-not-exist', new Token(['Test'], 'Test-Token-Name',  () => 'does-not-exist'))

        expect(() => new Sentence('Test something <<some-other-token>>', tokenMap)).to.throw(InvalidSentenceError);
    });

    it('When a Sentence is initialized, References in its text are replaced with a new Token and a reference to that Token.', () => {
        const sentence = new Sentence('This is a <<Token>>');

        //The ID has atleast 16 symbols
        expect(sentence.definition).to.match(new RegExp('This is a <<\\w{16,}>>'));

        //The Sentence has both normal Tokens ('This is a') and Reference Tokens (<<Token>>)
        expect(sentence.getSentenceType()).to.deep.equal(SentenceType.mixed);

        expect(sentence.tokens).to.have.length(1);
        const token = Array.from(sentence.tokens.values())[0];
        expect(token.name).to.equal('Token'); //Name is automatically copied from the Type, since no custom Name is given
        expect(token.types).to.deep.include('Token'); //Type is taken from the Sentence Definition
    });

    it('Simple Sentences are translated into simple capture regex.', () => {
        const sentence = new Sentence('Hello World!');

        expect(sentence.matchRegex).to.deep.equal(new RegExp('Hello World!', 'g'));
    });

    it('Mixed or Type Sentences are translated into empty capturing groups. These can match multiple things', () => {
        const sentence = new Sentence('<<TokenA>> <<TokenB>>');

        const otherSentence = new Sentence('Hello <<Token1>> <<Token2>> <<Token3>> <<Token4>>!!');

        const result = otherSentence.definition.match(sentence.matchRegex);
        /*  The ingenious thing here: The <<TokenA>> <<TokenB>> can (based only on the regex)
            match 3 different combinations of Tokens in the other Sentence:
                - <<Token1>> <<Token2>>
                - <<Token2>> <<Token3>>
                - <<Token4>> <<Token4>>
        */
        expect(result).to.have.length(3);
    });

    it('A Token Map can be used to "inject" already defined Token Definitions, for which the Tokens won\'t be translated.', () => {
        const tokenMap: Map<TokenId, Token> = new Map();
        const token = new Token(['TokenA'], 'Custom-Name');
        tokenMap.set('TokenA', token);
        const sentence = new Sentence('Some sentence using a <<TokenA>>', tokenMap);

        //No new Definition for the TokenA has been generated
        const referencedToken = Array.from(sentence.tokens.values())[0];
        expect(referencedToken.types).to.deep.include('TokenA');
        expect(referencedToken.name).to.equal('Custom-Name');

        const newSentenceWithoutDefinitions = new Sentence('Some sentence using a <<TokenA>>');

        const newReferencedToken = Array.from(newSentenceWithoutDefinitions.tokens.values())[0];
        expect(newReferencedToken.types).to.deep.include('TokenA'); //Type stays the same, since its given through the <<___>>
        expect(newReferencedToken.name).to.not.equal('Custom-Name'); //This is an auto-generated ID!
    });

    it('A sentence "appears" in another sentence, if its Regex can be matched successfully.', () => {
        const sentence = new Sentence('some random tokens');
        const otherSentence = new Sentence('This sentence includes some random tokens and even more!');

        expect(sentence.appearsIn(otherSentence));
    });

    it('A sentence "appears" in another sentence, if the Type Token of the sentence is matched.', () => {
        const sentence = new Sentence('<<TokenA>>');
        const otherSentence = new Sentence('A possible definition using <<TokenA>>.');

        //Should be applicable, since <<TokenA>> can be found in the other Sentence, too.
        expect(sentence.appearsIn(otherSentence)).to.be.true;

        //Names are irrelevant
        const namedSentence = new Sentence('<<TokenA@someWeirdName>>');
        //Should be applicable, since <<TokenA>> can be found in the other Sentence, too.
        expect(namedSentence.appearsIn(otherSentence)).to.be.true;

        //We artifically generate a Token with multiple Types.
        //Since one of these Types matches the definition, the Type Token appears in that sentence.
        const map: Map<TokenId, Token> = new Map();
        map.set('someTokenId', new Token(['TokenA', 'TokenB', 'TokenC'], 'some-custom-token'));
        const sentence2 = new Sentence('<<someTokenId>>', map);

        expect(sentence2.appearsIn(otherSentence)).to.be.true;
    });

    it('A sentence does not "appear" in another sentence, if a Reference has a different Type.', () => {
        const sentence = new Sentence('<<TokenA>>');
        const otherSentence = new Sentence('A possible definition using <<TokenA>>.');

        //The Types "TokenA" and "TokenB" can not be matched!
        expect(sentence.appearsIn(otherSentence)).to.be.true;
    });

    it('A sentence with mixed Tokens "appears" in another sentence, if both the syntactical features (simple Tokens in the regex) and the semantical features (Types of Reference Tokens) match.', () => {
        const sentence = new Sentence('This is a <<Token@customName>>');
        const otherSentence = new Sentence('This is a <<Token>> and it is being used within my Game!');

        //The "This is a"-Part matches, and the Tokens have the same Type. It should match!
        expect(sentence.appearsIn(otherSentence)).to.be.true;
    });

    describe('Appears In-Functionality.', () => {
        it('Simple Sentence -> Simple Sentence Rules are correctly evaluated to appear in other Sentences.', () => {
            const sentence1 = new Sentence('Test');
            const sentence2 = new Sentence('This is a Test!');
            expect(sentence1.appearsIn(sentence2)).to.be.true;
        });

        it('Simple Sentence -> Type Sentence Rules are correctly evaluated to appear in other Sentences.', () => {
            const sentence1 = new Sentence('Test');
            const sentence2 = new Sentence('<<Test>>');
            expect(sentence1.appearsIn(sentence2)).to.be.false;
        });

        it('Type Sentence -> Type Sentence Rules are correctly evaluated to appear in other Sentences.', () => {
            const sentence1 = new Sentence('<<Test>>');
            const sentence2 = new Sentence('<<Test2>>');
            expect(sentence1.appearsIn(sentence2)).to.be.false;
        });

        it('Type Sentence -> Mixed Sentence Rules are correctly evaluated to appear in other Sentences.', () => {
            const sentence1 = new Sentence('<<Test>>');
            const sentence2 = new Sentence('<<Test>> is a consumed Token!');
            expect(sentence1.appearsIn(sentence2)).to.be.true;
        });

        it('Mixed Sentence -> Type Sentence Rules are correctly evaluated to appear in other Sentences.', () => {
            const sentence1 = new Sentence('This is a <<Test>>');
            const sentence2 = new Sentence('<<TestSentence>>');
            expect(sentence1.appearsIn(sentence2)).to.be.false;
        });

        it('Mixed Sentence -> Mixed Sentence Rules are correctly evaluated to appear in other Sentences.', () => {
            const sentence1 = new Sentence('This is a <<Test>>');
            const sentence2 = new Sentence('This is a <<Test>> with something more!');
            expect(sentence1.appearsIn(sentence2)).to.be.true;
        });
    });

    describe('Full Match-Functionality.', () => {
        it('Simple Sentence -> Simple Sentence Rules are correctly evaluated to full-match in other Sentences.', () => {
            const sentence1 = new Sentence('This is a Test!');
            const sentence2 = new Sentence('This is a Test!');
            expect(sentence1.fullMatches(sentence2)).to.be.true;
        });

        it('Simple Sentence -> Type Sentence Rules are correctly evaluated to full-match other Sentences.', () => {
            const sentence1 = new Sentence('Test');
            const sentence2 = new Sentence('<<Test>>');
            expect(sentence1.fullMatches(sentence2)).to.be.false;
        });

        it('Type Sentence -> Type Sentence Rules are correctly evaluated to full-match other Sentences.', () => {
            const sentence1 = new Sentence('<<Test>>');
            const sentence2 = new Sentence('<<Test2>>');
            expect(sentence1.fullMatches(sentence2)).to.be.false;
        });

        it('Type Sentence -> Mixed Sentence Rules are correctly evaluated to full-match other Sentences.', () => {
            const sentence1 = new Sentence('<<Test>>');
            const sentence2 = new Sentence('<<Test>> is a consumed Token!');
            expect(sentence1.fullMatches(sentence2)).to.be.true;
        });

        it('Mixed Sentence -> Type Sentence Rules are correctly evaluated to full-match other Sentences.', () => {
            const sentence1 = new Sentence('This is a <<Test>>');
            const sentence2 = new Sentence('<<TestSentence>>');
            expect(sentence1.fullMatches(sentence2)).to.be.false;
        });

        it('Mixed Sentence -> Mixed Sentence Rules are correctly evaluated to full-match other Sentences.', () => {
            const sentence1 = new Sentence('<<ThisToken>> is a <<TestToken>>');
            const sentence2 = new Sentence('<<ThisToken>> is a <<TestToken>>');
            expect(sentence1.fullMatches(sentence2)).to.be.true;
        });
    });
});