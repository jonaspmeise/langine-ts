import { expect } from "chai";
import { GameRule } from "../../src/GameRule";
import { RulebookLoaderFactory } from "../../src/RulebookLoaderFactory";
import { InvalidRulebookException } from "../../src/Exceptions/InvalidRulebookException";

describe('Parsing Tests. Convert a Rulebook into a Set of Game Rules.', () => {
    const filename = './tests/parsing-rulebook/rulebook-1.md';

    it('A Rulebook can be loaded from a markdown file.', () => {
        const rulebookLoader = RulebookLoaderFactory.ofFile(filename);
        
        const gameRules = rulebookLoader.parse();
        
        expect(gameRules).to.have.length(11);
        expect(gameRules[0]).to.deep.equal(new GameRule('The game is played on a 3x3 grid.'));
    });

    it('A Rulebook has to be provided from a valid file.', () => {
        expect(() => RulebookLoaderFactory.ofFile('non-existing.haha')).to.throw(Error);
    });

    it('A Rulebook has to contain atleast one Rule that matches the Search RegExp.', () => {
        const rulebookLoader = RulebookLoaderFactory.ofText('this aint a rulebook chief');

        expect(() => rulebookLoader.parse())
            .to.throw(InvalidRulebookException);
    });

    it('The RegExp that is used to search for Rules in a Rulebook has to have a named capturing group named "Rule".', () => {
        const rulebookLoader = RulebookLoaderFactory.ofFile(filename);

        expect(() => rulebookLoader.parse(`{{(.+?)}}`)) //no named capturing group here! Expected "{{(?<rule>.+?)}}"
            .to.throw(InvalidRulebookException);
    });

    it('A Rule that spreads over multiple lines is parsed correctly.', () => {
        const rulebookLoader = RulebookLoaderFactory.ofText(`{{This\nis a\nmultiline-rule.}}`);

        const rules = rulebookLoader.parse();

        expect(rules).to.have.length(1);
        expect(rules[0]).to.deep.equal(new GameRule(`This is a multiline-rule.`));
    });

    it('A Rule that has padded spaces left or right is trimmed correctly.', () => {
        const rulebookLoader = RulebookLoaderFactory.ofText(
            `{{ This is a rule.    }}\n
            {{    This too!!    }}`);

        const rules = rulebookLoader.parse();

        expect(rules).to.have.length(2);
        expect(rules).to.deep.equal([
            new GameRule(`This is a rule.`),
            new GameRule(`This too!!`)
        ]);
    })
});