import { expect } from "chai";
import { Rulebook } from "../../src/Rulebook/Rulebook";
import { Grammar } from "../../src/Grammar/Grammar";

describe('Tic-Tac-Toe Integration Test.', () => {
    beforeEach(() => {
        const rulebook = Rulebook.ofFile('./tests/game-integration-tests/TicTacToe-Rulebook.md');
        const grammar = Grammar.ofFile('./tests/game-integration-tests/TicTacToe-Grammar.langine');

        const syntaxTrees = grammar.parse(rulebook);

        console.log(syntaxTrees);
    });

    it('Test.', () => {
        expect(true).to.be.true;
    })
});