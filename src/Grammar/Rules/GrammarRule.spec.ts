import { expect } from "chai";
import { SentenceFactory } from "../../Sentence/SentenceFactory";
import { GrammarRuleFactory } from "./GrammarRuleFactory";

describe('Grammar Rules.', () => {
    describe('canBeAppliedTo(sentence) works.', () => {
        describe('Type Grammar Rule (Input: Simple).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('Text'), SentenceFactory.parse('<<TextToken>>'));

            const testCases = [
                {text: 'This is a Text', appliable: true},
                {text: 'This is a text', appliable: false},
                {text: 'Text Text', appliable: true}
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.appliable ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    expect(grammarRule.canBeAppliedTo(SentenceFactory.parse(testCase.text))).to.equal(testCase.appliable);
                });
            });
        });

        describe('Type Grammar Rule (Input: Type).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<Token>>'), SentenceFactory.parse('<<GeneralToken>>'));

            const testCases = [
                {text: '<<Token>>', appliable: true}, //works, because same type.
                {text: '<<Token@partialText>>', appliable: true}, //works, because same type. name should not change the matching.
                {text: '<<SomethingDifferent>>', appliable: false} //does not work, because the types are different.
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.appliable ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    expect(grammarRule.canBeAppliedTo(SentenceFactory.parse(testCase.text))).to.equal(testCase.appliable);
                });
            });
        });

        describe('Type Grammar Rule (Input: Mixed).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('<<TokenA>> equals <<TokenB>>'), SentenceFactory.parse('<<GeneralToken>>'));

            const testCases = [
                {text: 'Did you know: <<TokenA>> equals <<TokenB>> equals something different!', appliable: true}, //works, because same type.
                {text: '<<TokenA>> equals <<TokenB>> equals <<TokenC>>', appliable: true}, //works, because same type.
                {text: '<<TokenC>> equals <<TokenB>> equals <<TokenA>>', appliable: false}, //does not work; wrong types
                {text: '<<TokenA>> does not equal <<TokenB>>', appliable: false}, //normal Tokens do not match
                {text: '<<TokenA>>', appliable: false} //does not work.
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.appliable ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    expect(grammarRule.canBeAppliedTo(SentenceFactory.parse(testCase.text))).to.equal(testCase.appliable);
                });
            });
        });

        describe('Replacement Grammar Rule (Input: Simple).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('Is this a Token?'), SentenceFactory.parse('Token this is?'));

            const testCases = [
                {text: 'Is this a Token?', appliable: true},
                {text: 'I have a question: Is this a Token???', appliable: true},
                {text: 'Is this a <<Token>>?', appliable: false},
                {text: 'Token', appliable: false},
                {text: 'IS THIS A TOKEN', appliable: false}
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.appliable ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    expect(grammarRule.canBeAppliedTo(SentenceFactory.parse(testCase.text))).to.equal(testCase.appliable);
                });
            });
        });
     
        describe('Replacement Grammar Rule (Input: Mixed).', () => {
            const grammarRule = GrammarRuleFactory.build(SentenceFactory.parse('This is a <<Text>>'), SentenceFactory.parse('A <<Text>> is this'));

            const testCases = [
                {text: 'This is a <<Text>>', appliable: true},
                {text: 'Is this is a <<Text>>?', appliable: false},
                {text: 'This is a <<SomethingElse>>', appliable: false}
            ];

            testCases.forEach((testCase) => {
                it(`"${grammarRule.pretty()}" can${testCase.appliable ? '' : '\'t'} be applied to "${testCase.text}"`, () => {
                    expect(grammarRule.canBeAppliedTo(SentenceFactory.parse(testCase.text))).to.equal(testCase.appliable);
                });
            });
        });
    });
});