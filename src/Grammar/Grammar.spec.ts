import { expect } from "chai";
import { GameRule } from "../Rulebook/GameRule";
import { Grammar } from "./Grammar";
import { InvalidGrammarError } from "../Exceptions/InvalidGrammarError";
import { ParsingError } from "../Exceptions/ParsingError";
import { Logger } from "../Logger/Logger";

describe('Grammar.', () => {
    //Default function implementations? Simply "handing" through the Object?
    //Priority on order of evaluation of Grammar Rules based on priority in the Grammar.
    //After constructing a Grammar, warn when there are Rules that are not.
    //If a Grammar Rule could not be parsed finally into <<Rule>>, <<Component>>, <<Entity>> or <<Action>>.

    //Comments and empty lines are skipped
    //THrow error when a grammar rule could not be parsed.
    //shortcut to create multiple rules: A | B | C -> something

    it('When parsing a Game Rule, the Game Rules are called iteratively on the current evaluation. Game Rules defined first have a higher priority.', () => {
        const grammar = Grammar.ofText(`
            A -> <<A>>
            A2 -> <<A2>>
            <<A>>2 -> B
        `);

        grammar.parseStep(new GameRule('A2A2A2'));
    });

    it('Parsing Grammar Rules from a text with identation works.', () => {
        const grammar = Grammar.ofText(`
            this -> <<Identifier>>
            test -> <<Something>>
            <<Identifier>> is a <<Something>> -> <<Rule>>
        `);

        expect(grammar).to.have.length(3);
        expect(grammar).to.have.keys('this', 'test', '<<Identifier>> is a <<Something>>');
    });

    it('Parsing Grammar Rules from a text with empty lines works.', () => {
        const grammar = Grammar.ofText(`
            this -> <<Identifier>>

            test -> <<Something>>

            <<Identifier>> is a <<Something>> -> <<Rule>>
        `);

        expect(grammar).to.have.length(3);
    });

    it('Parsing Grammar Rules from a text with comments (#...) works.', () => {
        const grammar = Grammar.ofText(`
            this -> <<Identifier>>
            # This is a comment!
            test -> <<Something>>
            # This too!
            <<Identifier>> is a <<Something>> -> <<Rule>>



        `);

        expect(grammar).to.have.length(3);
    });

    it('When parsing Game Rules, the given text must not be empty.', () => {
        expect(() => Grammar.ofText('')).to.throw(InvalidGrammarError);
    });

    it('When parsing a Game Rule, if there is no match to be found, throw an Error.', () => {
        const grammar = Grammar.ofText('dummy -> dummy value #2');

        expect(() => grammar.parseStep(new GameRule('some-non-parseble-value'))).to.throw(ParsingError);
    });

    it('When an infinite loop would be caused while parsing a Game Rule, an Error is thrown.', () => {
        //This would cause an infinite self-reference chain!
        const grammar = Grammar.ofText(`
            test -> <<A>>
            <<A>> -> <<B>>
            <<B>> -> <<A>>
        `);
        let parsed = grammar.parseStep(new GameRule('test')); //holds: <<A>> something
        parsed = grammar.parseStep(parsed); //holds: <<B>> something

        //when we parse the next Step, we would receive a result that we already encountered before. This would cause the infinite loop!
        expect(() => grammar.parseStep(parsed)).to.throw(ParsingError);
    });

    it('Issue a warning if there are multiple Rules that consume the same Input.', function(done) {
        const logger: Logger = {
            warn: (_) => {done(); return undefined},
            error: (_) => undefined,
            info: (_) => undefined,
            debug: (_) => undefined
        };
        
        //This Grammar matches two Outputs to the same Output. This should not be the case.
        Grammar.ofText(`
            test -> <<A>>
            <<A>> something -> <<B>>
            <<A>> something -> something else...?
        `, logger);
    });

    it('Parsing a Game Rule step by step works.', () => {
        const rule = new GameRule('this is a test!');

        const grammar = Grammar.ofText(`
            this -> <<Identifier>>
            test -> <<Something>>
            <<Identifier>> is a <<Something>> -> <<Rule>>
            <<Rule>>! -> <<Rule>>
        `);

        let parsed = grammar.parseStep(rule);
        expect(parsed.text).to.deep.equal('<<Identifier>> is a test!');
        
        parsed = grammar.parseStep(parsed);
        expect(parsed.text).to.deep.equal('<<Identifier>> is a <<Something>>!');

        parsed = grammar.parseStep(parsed);
        expect(parsed.text).to.deep.equal('<<Rule>>!');

        parsed = grammar.parseStep(parsed);
        expect(parsed.text).to.deep.equal('<<Rule>>');
    });

    it('Parsing a Game Rule with a Grammar Rule that has named Types works.', () => {
        const rule = new GameRule('something consists out of something else');

        const grammar = Grammar.ofText(`
            something -> <<SomethingToken>>
            <<SomethingToken>> else -> <<SomethingToken>>

            consists out of -> <<ConsistsToken>>
            <<SomethingToken>> -> <<Component>>
            <<Component@A>> <<ConsistsToken>> <<Component@B>> -> <<ConsistsRule>>
            <<ConsistsRule>> -> <<Rule>>
        `);

        const result = grammar.parse(rule);

        //The rule could be parsed successfully!
        expect(result.text).to.deep.equal('<<Rule>>');
        //We needed a total of 6 Steps to solve the Rule
        expect(result.history).to.have.length(8);
    });

    it('A single parse step with a Grammar Rule thas has named Types works.', () => {
        const rule = new GameRule('<<Component>> <<ConsistsToken>> <<Component>>');

        const grammar = Grammar.ofText(`
            <<Component@A>> <<ConsistsToken>> <<Component@B>> -> <<ConsistsRule>>
        `);

        expect(grammar.parseStep(rule).text).to.deep.equal('<<ConsistsRule>>');
    });
});