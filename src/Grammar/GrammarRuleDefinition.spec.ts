import { expect } from "chai";
import { GrammarRuleDefinition } from "./GrammarRuleDefinition";
import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";

describe('Grammar Rule Definition.', () => {
    it('A provided Grammar Rule is correctly transformed into a RegEx query, which can be applied when parsing the Game Rules.', () => {
        const rule1 = new GrammarRuleDefinition('<<Part1>> does something with <<Part2>>');
        const rule2 = new GrammarRuleDefinition('Test something!');
        const rule3 = new GrammarRuleDefinition('<<abc@Part>> does something with <<def@Part>>');

        //The Flag 'i' is set because by default, the parsing is done case-insensitively
        expect(new Set(rule1.regexQueries)).to.deep.equal(new Set([
            new RegExp(`^(?<Part1>.+?) does something with (?<Part2>.+?)$`, 'i'),
            new RegExp(`^(?<Part1>.+?) does something with (?<Part2>.+)$`, 'i'),
            new RegExp(`^(?<Part1>.+) does something with (?<Part2>.+?)$`, 'i'),
            new RegExp(`^(?<Part1>.+) does something with (?<Part2>.+)$`, 'i')
        ]));

        expect(new Set(rule2.regexQueries)).to.deep.equal(new Set([
            new RegExp(`^Test something!$`, 'i')
        ]));   
        
        expect(new Set(rule3.regexQueries)).to.deep.equal(new Set([
            new RegExp(`^(?<abc>.+?) does something with (?<def>.+?)$`, 'i'),
            new RegExp(`^(?<abc>.+?) does something with (?<def>.+)$`, 'i'),
            new RegExp(`^(?<abc>.+) does something with (?<def>.+?)$`, 'i'),
            new RegExp(`^(?<abc>.+) does something with (?<def>.+)$`, 'i')
        ]));
    });
    
    it('A named Reference has to have a correct format.', () => {
        expect(() => new GrammarRuleDefinition('<<Holder@Component@Component>> has something')).to.throw(InvalidGrammarException);

        expect(() => new GrammarRuleDefinition('<<@Component>> exists')).to.throw(InvalidGrammarException);
    });

    it('Creating RegExp-Variations works correctly.', () => {
        const regex = new RegExp('^(?<Part1>.+) does something with (?<Part2>.+) to cause (?<Part3>.+)$', 'i');

        const variations = GrammarRuleDefinition.createRegexVariations(regex);

        expect(variations).to.have.length(8); //3 references, 2**3 == 8
        expect(new Set(variations)).to.deep.equal(new Set([
            new RegExp('^(?<Part1>.+?) does something with (?<Part2>.+?) to cause (?<Part3>.+?)$', 'i'),
            new RegExp('^(?<Part1>.+?) does something with (?<Part2>.+?) to cause (?<Part3>.+)$', 'i'),
            new RegExp('^(?<Part1>.+?) does something with (?<Part2>.+) to cause (?<Part3>.+?)$', 'i'),
            new RegExp('^(?<Part1>.+?) does something with (?<Part2>.+) to cause (?<Part3>.+)$', 'i'),
            new RegExp('^(?<Part1>.+) does something with (?<Part2>.+?) to cause (?<Part3>.+?)$', 'i'),
            new RegExp('^(?<Part1>.+) does something with (?<Part2>.+?) to cause (?<Part3>.+)$', 'i'),
            new RegExp('^(?<Part1>.+) does something with (?<Part2>.+) to cause (?<Part3>.+?)$', 'i'),
            new RegExp('^(?<Part1>.+) does something with (?<Part2>.+) to cause (?<Part3>.+)$', 'i')
        ]));
    });
});