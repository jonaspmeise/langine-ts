import { expect } from "chai";
import { GrammarRuleError } from "../../Error/GrammarRuleError";
import { MixedSentence } from "../../Sentence/MixedSentence";
import { ReplacementGrammarRule } from "./ReplacementGrammarRule";

describe('Replacement Grammar Rules.', () => {
    it('If there are References in the Output which do not appear in the Input, throw an Error.', () => {
        expect(() => new ReplacementGrammarRule(new MixedSentence('A <<Token>> exists!'), new MixedSentence('<<Something>> exists!'))).to.throw(GrammarRuleError);
    });

    it('Named References that appear in the Output also need to be referenced that way in the Input.', () => {
        expect(() => new ReplacementGrammarRule(new MixedSentence('<<Something@A>> equals <<Something@B>>'), new MixedSentence('<<Something>> is equal to <<B>>'))).to.throw(GrammarRuleError);
        
        new ReplacementGrammarRule(new MixedSentence('<<Something@A>> equals <<Something@B>>'), new MixedSentence('<<Something@A>> is equal to <<Something@B>>'));
    });

    it('Identical References in the Input and Output are equalized after creation. This makes searching/replacing easier.', () => {
        const input = new MixedSentence('<<TokenA>> equals <<TokenB@Identifier>>');
        const output = new MixedSentence('<<TokenA>> equals <<TokenB@Identifier>>');

        //The two sentences are not equal, since the generated IDs of each Reference are unique
        expect(input.getDefinition()).to.not.equal(output.getDefinition());

        const rule = new ReplacementGrammarRule(input, output);
        //After creation, input and Output should be the same, though.
        //This makes applying the Grammar Rule to Game Rules in the future way easier.

        expect(rule.input.getDefinition()).to.deep.equal(rule.output.getDefinition());
    });
});