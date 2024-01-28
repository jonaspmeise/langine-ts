import { expect } from "chai";
import { GameRule } from "./GameRule";
import { InvalidRulebookException } from "../Exceptions/InvalidRulebookException";
import { Rulebook } from "./Rulebook";

describe('Gamebook Tests.', () => {
    it('A Rulebook has to be provided from a valid file.', () => {
        expect(() => Rulebook.ofFile('non-existing.haha')).to.throw(InvalidRulebookException);
    });

    it('A Rulebook has to contain atleast one valid Game Mechanic (either matches the default notation of {{RULE}} or has to be supplied from an Extractor Function).', () => {
        expect(() => Rulebook.ofText('this aint a rulebook chief')).to.throw(InvalidRulebookException);
    });

    it('A custom Extractor Function can be used.', () => {
        const rulebook = Rulebook.ofText(`**At the start of your Turn, draw a Card.**`, (text) => text.match(new RegExp('(?<=\\*\\*).+?(?=\\*\\*)', 'gm')) ?? []);

        expect(rulebook).to.have.length(1);
        expect(rulebook[0]).to.deep.equal(new GameRule(`At the start of your Turn, draw a Card.`));
    });

    it('A Rule that spreads over multiple lines is parsed correctly.', () => {
        const rulebook = Rulebook.ofText(`{{This\nis a\nmultiline-rule.}}`);

        expect(rulebook).to.have.length(1);
        expect(rulebook[0]).to.deep.equal(new GameRule(`This is a multiline-rule.`));
    });

    it('A Rule that has padded spaces left or right is trimmed correctly.', () => {
        const rulebook = Rulebook.ofText(`
            {{ This is a rule.    }}\n
            {{    This too!!    }}
        `);

        expect(rulebook).to.have.length(2);
        expect(rulebook).to.deep.equal([
            new GameRule(`This is a rule.`),
            new GameRule(`This too!!`)
        ]);
    });
});