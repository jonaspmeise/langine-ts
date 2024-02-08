import { expect } from "chai";
import { SentenceFactory } from "../../Sentence/SentenceFactory";
import { GrammarRuleFactory } from "./GrammarRuleFactory";

describe('Grammar Rules.', () => {
    describe('getApplicableTokens(sentence) works.', () => {
        describe('Type Grammar Rule (Input: Simple).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('Text'), SentenceFactory.parse('<<TextToken>>'));

            const testCases = [
                {text: 'This is a Text', works: true, match: 'Text', references: 0},
                {text: 'This is a text', works: false, match: null, references: 0},
                {text: 'Text Text', works: true, match: 'Text', references: 0}
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.works ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    const applicableTokens = grammarRule.getApplicableTokens(SentenceFactory.parse(testCase.text));

                    //Our Test Case is impossible, and we also did not find anything.
                    if(applicableTokens === null && !testCase.works) return;

                    expect(applicableTokens).to.not.be.null;

                    expect(applicableTokens!.matchedText).to.equal(testCase.match);
                    expect(applicableTokens!.referenceMatches).has.length(testCase.references);
                });
            });
        });

        describe('Type Grammar Rule (Input: Type).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<Token>>'), SentenceFactory.parse('<<GeneralToken>>'));

            const testCases = [
                {text: '<<Token>>', works: true, references: 1}, //works, because same type.
                {text: '<<Token@partialText>>', works: true, references: 1}, //works, because same type. name should not change the matching.
                {text: '<<SomethingDifferent>>', works: false, references: 0} //does not work, because the types are different.
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.works ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    const applicableTokens = grammarRule.getApplicableTokens(SentenceFactory.parse(testCase.text));

                    //Our Test Case is impossible, and we also did not find anything.
                    if(applicableTokens === null && !testCase.works) return;

                    expect(applicableTokens).to.not.be.null;
                    expect(applicableTokens!.referenceMatches).has.length(testCase.references);
                });
            });
        });

        describe('Type Grammar Rule (Input: Mixed).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<TokenA>> equals <<TokenB>>'), SentenceFactory.parse('<<GeneralToken>>'));

            const testCases = [
                {text: 'Did you know: <<TokenA>> equals <<TokenB>> equals something different!', works: true, references: 2}, //works, because same type.
                {text: '<<TokenA>> equals <<TokenB>> equals <<TokenC>>', works: true, references: 2}, //works, because same type.
                {text: '<<TokenC>> equals <<TokenB>> equals <<TokenA>>', works: false, references: 0}, //does not work; wrong types
                {text: '<<TokenA>> does not equal <<TokenB>>', works: false, references: 0}, //normal Tokens do not match
                {text: '<<TokenA>>', works: false, references: 0} //does not work.
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.works ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    const applicableTokens = grammarRule.getApplicableTokens(SentenceFactory.parse(testCase.text));

                    //Our Test Case is impossible, and we also did not find anything.
                    if(applicableTokens === null && !testCase.works) return;

                    expect(applicableTokens).to.not.be.null;
                    expect(applicableTokens!.referenceMatches).has.length(testCase.references);
                });
            });
        });

        describe('Replacement Grammar Rule (Input: Simple).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('Is this a Token?'), SentenceFactory.parse('Token this is?'));

            const testCases = [
                {text: 'Is this a Token?', works: true},
                {text: 'I have a question: Is this a Token???', works: true},
                {text: 'Is this a <<Token>>?', works: false},
                {text: 'Token', works: false},
                {text: 'IS THIS A TOKEN', works: false}
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.works ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    const applicableTokens = grammarRule.getApplicableTokens(SentenceFactory.parse(testCase.text));

                    //Our Test Case is impossible, and we also did not find anything.
                    if(applicableTokens === null && !testCase.works) return;

                    expect(applicableTokens?.matchedText).to.equal('Is this a Token?');
                });
            });
        });
     
        describe('Replacement Grammar Rule (Input: Mixed).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('This is a <<Text>>'), SentenceFactory.parse('A <<Text>> is this'));

            const testCases = [
                {text: 'This is a <<Text>>', works: true},
                {text: 'Is this is a <<Text>>?', works: false},
                {text: 'This is a <<SomethingElse>>', works: false}
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.works ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    const applicableTokens = grammarRule.getApplicableTokens(SentenceFactory.parse(testCase.text));

                    //Our Test Case is impossible, and we also did not find anything.
                    if(applicableTokens === null && !testCase.works) return;

                    expect(applicableTokens).to.not.be.null;
                    expect(applicableTokens?.referenceMatches).to.have.length(1);
                });
            });
        });
    });

    describe('applyTo(sentence) works.', () => {
        describe('Replacement Grammar Rule (Input: Simple).', () => {
            it('#1', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('Text'), SentenceFactory.parse('other Text Variation'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('This is a Text'));

                expect(new RegExp('^This is a other Text Variation$').test(newSentence.getDefinition())).to.be.true;
                expect(newSentence.references).has.length(0);
            });

            it('#2', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('Text'), SentenceFactory.parse('Something else'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('Text is a Text'));

                expect(new RegExp('^Something else is a Text$').test(newSentence.getDefinition())).to.be.true;
                expect(newSentence.references).has.length(0);
            });
        });

        describe('Replacement Grammar Rule (Input: Mixed).', () => {
            it('#1', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<Something@A>> equals <<Something@B>>'), SentenceFactory.parse('<<Something@B>> is equal to <<Something@A>>'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('<<Something@Part1>> equals <<Something@Part2>> equals <<Something@Part3>>'));

                expect(new RegExp('^<<.+?>> equals <<.+?>>$').test(newSentence.getDefinition())).to.be.true;
                //We did not consume any References, just switched them around (so to say)
                expect(newSentence.references).has.length(3);
            });
        });

        describe('Type Grammar Rule (Input: Simple).', () => {
            it('#1', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('Text'), SentenceFactory.parse('<<TextToken>>'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('This is a Text'));

                expect(new RegExp('^This is a <<.+?>>$').test(newSentence.getDefinition())).to.be.true;
                expect(newSentence.references).has.length(1);

                const reference = Array.from(newSentence.references.values())[0];
                expect(reference.name).to.equal('TextToken');
                expect(reference.types).to.deep.include('TextToken');
            });

            it('#2', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('many tokens'), SentenceFactory.parse('<<TextToken@CustomName>>'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('A text can consist out of many tokens, or many tokens!'));

                //If there are multiple references, only the first occurence is matched
                expect(new RegExp('^A text can consist out of <<.+?>>, or many tokens!$').test(newSentence.getDefinition())).to.be.true;
                expect(newSentence.references).has.length(1);

                const reference = Array.from(newSentence.references.values())[0];
                expect(reference.name).to.equal('CustomName');
                expect(reference.types).to.deep.include('TextToken');
            });
        });

        describe('Type Grammar Rule (Input: Type).', () => {
            it('#1', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<TextToken>>'), SentenceFactory.parse('<<Text>>'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('This is a <<TextToken>>'));

                expect(new RegExp('^This is a <<.+?>>$').test(newSentence.getDefinition())).to.be.true;
                //the old reference is overwritten with the new reference -> we only have 1 reference remaining!
                expect(newSentence.references).has.length(1);

                const reference = Array.from(newSentence.references.values())[0];
                expect(reference.name).to.equal('Text');
                //Such Types are added to the given Token.
                expect(reference.types).to.deep.equal(['TextToken', 'Text']);

                //TODO: How to test for the "parsed"/"created" objects???
            });

            it('#2', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<MultipleTokens>>'), SentenceFactory.parse('<<Multiple@CustomName>>'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('A text can consist out of <<MultipleTokens@A>>, or <<MultipleTokens@B>>!'));

                //If there are multiple references, only the first occurence is matched
                expect(new RegExp('^A text can consist out of <<.+?>>, or many tokens!$').test(newSentence.getDefinition())).to.be.true;
                expect(newSentence.references).has.length(1);

                const reference = Array.from(newSentence.references.values())[0];
                //The name is overwritten, too. We already evaluated the name in this function and do not require it in the future.
                expect(reference.name).to.equal('CustomName');
                expect(reference.types).to.deep.equal(['MultipleTokens', 'Multiple']);

                //TODO: How to test for the "parsed"/"created" objects???
            });
        });

        describe('Type Grammar Rule (Input: Mixed).', () => {
            it('#1', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<Something@A>> equals <<Something@B>>'), SentenceFactory.parse('<<Equal>>'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('<<Something@Part1>> equals <<Something@Part2>> => <<Something@Else>> equals <<Something@Part3>>'));

                expect(new RegExp('^<<.+?>> => <<.+?>> equals <<.+?>>$').test(newSentence.getDefinition())).to.be.true;
                //we originally had 4 references, but two were consumed.
                expect(newSentence.references).has.length(3);

                const reference = Array.from(newSentence.references.values())[0];
                expect(reference.name).to.equal('Text');
                //Such Types are added to the given Token.
                expect(reference.types).to.deep.equal(['TextToken', 'Text']);

                //TODO: How to test for the "parsed"/"created" objects???
            });

            it('#2', () => {
                const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<MultipleTokens>>'), SentenceFactory.parse('<<Multiple@CustomName>>'));

                const newSentence = grammarRule.applyTo(SentenceFactory.parse('A text can consist out of <<MultipleTokens@A>>, or <<MultipleTokens@B>>!'));

                //If there are multiple references, only the first occurence is matched
                expect(new RegExp('^A text can consist out of <<.+?>>, or many tokens!$').test(newSentence.getDefinition())).to.be.true;
                expect(newSentence.references).has.length(1);

                const reference = Array.from(newSentence.references.values())[0];
                //The name is overwritten, too. We already evaluated the name in this function and do not require it in the future.
                expect(reference.name).to.equal('CustomName');
                expect(reference.types).to.deep.equal(['MultipleTokens', 'Multiple']);

                //TODO: How to test for the "parsed"/"created" objects???
            });
        });
    });
});