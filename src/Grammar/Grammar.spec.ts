import { expect } from "chai";
import { InvalidGrammarError } from "../Error/InvalidGrammarError";
import { Grammar } from "./Grammar";
import { Logger } from "../Logger/Logger";

describe('Grammar.', () => {
    describe('from() works.', () => {
        describe('from(text) works.', () => {
            it('Each line has to adhere to the proper Grammar Rule format.', () => {
                //The following rule is missing the " -> [OUTPUT]"-Part
                const text = 'This is a broken Rule';

                expect(() => Grammar.from(text)).to.throw(InvalidGrammarError);
            });

            it('Empty lines are ignored.', () => {
                const text = `This is a Rule -> <<Rule>>
                
                This is another Rule -> <<Rule>>

                And the last thing -> And the last object
                `;

                const grammar = Grammar.from(text);

                expect(grammar.rules).to.have.length(3);
            });

            it('Comments are ignored.', () => {
                const text = `This is a Rule -> <<Rule>>
                # Comment 1
                This is another Rule -> <<Rule>>
                # Comment 2
                And the last thing -> And the last object
                `;

                const grammar = Grammar.from(text);

                expect(grammar.rules).to.have.length(3);
            });
        });
    });

    it('A warning is issued if the Grammar is initiated without any rules.', function(done) {
        const logger: Logger = {
            error: (_: string) => undefined,
            warn: (_: string) => done(),
            info: (_: string) => undefined,
            debug: (_: string) => undefined
        }

        new Grammar([], logger);
    });

    it('Multiple Rules can be defined at the same time by using the "|"-Operator.', () => {
        const text = '<<TokenA>> | <<TokenB>> | Some <<TokenC>> -> <<UmbrellaToken>>';

        const grammar = Grammar.from(text);
        expect(grammar.rules).to.have.length(3);
    });
});