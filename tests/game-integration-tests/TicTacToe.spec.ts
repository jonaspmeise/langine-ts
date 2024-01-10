import { expect } from "chai";
import { Grammar } from "../../src/Grammar/Grammar";
import { Rulebook } from "../../src/Rulebook/Rulebook";

describe('Tic-Tac-Toe Integration Test.', () => {

    beforeEach(() => {
        const rulebook = Rulebook.ofFile('./tests/game-integration-tests/TicTacToe-Rulebook.md');
        const grammar = Grammar.ofFile('./tests/game-integration-tests/TicTacToe-Grammar.yaml');

        const syntaxTrees = grammar.parseRules(rulebook, 'MetaRule');

        console.log(syntaxTrees);
    });

    it('Test.', () => {
        expect(true).to.be.true;
    })
});