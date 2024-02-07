import { expect } from "chai";
import { InvalidGrammarRuleError } from "../../Error/InvalidGrammarRuleError";
import { MixedSentence } from "../../Sentence/MixedSentence";
import { ReplacementGrammarRule } from "./ReplacementGrammarRule";

describe('Replacement Grammar Rules.', () => {
    it('If there are References in the Output which do not appear in the Input, throw an Error.', () => {
        expect(() => new ReplacementGrammarRule(new MixedSentence('A <<Token>> exists!'), new MixedSentence('<<Something>> exists!'))).to.throw(InvalidGrammarRuleError);
    });
});