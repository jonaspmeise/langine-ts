import { expect } from "chai";
import { GrammarRuleDefinition } from "./GrammarRuleDefinition";
import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";

describe('Grammar Rule Definition.', () => {
    it('A provided Grammar Rule is correctly transformed into a RegEx query, which can be applied when parsing the Game Rules.', () => {
        const rule1 = new GrammarRuleDefinition('<<Part1>> does something with <<Part2>>');
        const rule2 = new GrammarRuleDefinition('Test something!');
        const rule3 = new GrammarRuleDefinition('<<abc@Part>> does something with <<def@Part>>');

        expect(rule1.queryRegex).to.deep.equal(new RegExp(`^(?<Part1>.+) does something with (?<Part2>.+)$`));
        expect(rule2.queryRegex).to.deep.equal(new RegExp(`^Test something!$`));
        expect(rule3.queryRegex).to.deep.equal(new RegExp(`^(?<abc>.+) does something with (?<def>.+)$`));
    });
    
    it('A named Reference has to have a correct format.', () => {
        expect(() => new GrammarRuleDefinition('<<Holder@Component@Component>> has something')).to.throw(InvalidGrammarException);

        expect(() => new GrammarRuleDefinition('<<@Component>> exists')).to.throw(InvalidGrammarException);
    });
});