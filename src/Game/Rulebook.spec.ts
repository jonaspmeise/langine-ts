import { expect } from "chai";
import { InvalidRulebookError } from "../Error/InvalidRulebookError";
import { Rulebook } from "./Rulebook";

describe('Rulebook.', () => {
    it('A Rulebook has to have atleast one Rule.', () => {
        expect(() => new Rulebook([])).to.throw(InvalidRulebookError);
        expect(() => Rulebook.from('')).to.throw(InvalidRulebookError);
    });

    it('A Rulebook only parses Rules of a specific format (default: {{...}}).', () => {
        const text = `
        This is a Game!
        It has some rules:
        
        - unimportant rule 1
        - {{ important rule 2! }}
        - some other rules, nobody cares about them.
        
        When you write a Rulebook, you can include as much fluff as you like.
        You just need to atleast provide some Game Rules which are valid and match a given format.
        
        {{ Like this! }}
        
        This can also work for multi-line-Rules, in case you have a rule which spans multiple paragraphs or sentences.
        {{ Thus, this rule would be perfectly viable.
        Despite having multiple sentences (what even is a sentence, let's be real?), they all get interpreted as one coherent rule.
        It is up to you, game developer, to interpret these rules correctly!}}
        {{      Roger that? Even Spaces are trimmed!               }}`;

        const rulebook = Rulebook.from(text);

        expect(rulebook.rules).has.length(4);
        expect(rulebook.rules[3].sentence.definition).to.equal('Roger that? Even Spaces are trimmed!');
    });
});