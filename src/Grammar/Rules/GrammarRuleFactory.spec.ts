import { expect } from "chai";
import { ReplacementGrammarRule } from "./ReplacementGrammarRule";
import { TypeGrammarRule } from "./TypeGrammarRule";
import { GrammarRuleFactory } from "./GrammarRuleFactory";
import { SentenceFactory } from "../../Sentence/SentenceFactory";
import { MixedSentence } from "../../Sentence/MixedSentence";
import { InvalidGrammarRuleError } from "../../Error/InvalidGrammarRuleError";

describe('Grammar Rule Factory.', () => {
    const replacementRules = [
        {input: SentenceFactory.parse('This is a simple Sentence'), output: SentenceFactory.parse('A shorter output')},
        {input: SentenceFactory.parse('This is a mixed <<Sentence>>'), output: SentenceFactory.parse('This is an output with <<Sentence>>')},
        {input: SentenceFactory.parse('This is a mixed <<Sentence>>'), output: SentenceFactory.parse('Another output!')},
    ];

    const typeRules = [
        {input: SentenceFactory.parse('This is a simple Sentence'), output: SentenceFactory.parse('<<aNewType>>')},
        {input: SentenceFactory.parse('<<TypeSpecific>>'), output: SentenceFactory.parse('<<TypeGeneral>>')},
        {input: SentenceFactory.parse('This is a mixed <<Sentence>>'), output: SentenceFactory.parse('<<Combination>>')}
    ];

    describe('build() works.', () => {
        replacementRules.forEach((testCase) => {
            it(`"${testCase.input.definition}" (${typeof testCase.input}) -> "${testCase.output.definition}" (${typeof testCase.output}) => Replacement Grammar Rule`, () => {
                expect(GrammarRuleFactory.build(testCase.input, testCase.output)).to.be.instanceof(ReplacementGrammarRule);
            });
        });

        typeRules.forEach((testCase) => {
            it(`"${testCase.input.definition}" (${typeof testCase.input}) -> "${testCase.output.definition}" (${typeof testCase.output}) => Type Grammar Rule`, () => {
                expect(GrammarRuleFactory.build(testCase.input, testCase.output)).to.be.instanceof(TypeGrammarRule);
            });
        });
    });

    it('In a Replacement Grammar Rule, if the output has References, the input has to have the same References.', () => {
        expect(() => new ReplacementGrammarRule(new MixedSentence('This has a <<Token>>'), new MixedSentence('A <<object>> has this.'))).to.throw(InvalidGrammarRuleError);

        const rule = new ReplacementGrammarRule(new MixedSentence('<<Token>> is here.'), new MixedSentence('Here is <<Token>>'));
        expect(rule).to.not.be.undefined;
    });
});