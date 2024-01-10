import { expect } from "chai";
import { GameRule } from "../Rulebook/GameRule";
import { cleanYamlString } from "../Util";
import { Grammar } from "./Grammar";
import { ParsingException } from "../Exceptions/ParsingException";
import { Rulebook } from "../Rulebook/Rulebook";
import { Logger } from "../Logger/Logger";
import { fail } from "assert";
import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";

describe('Parsing Examples.', () => {
    it('Single Game Rule is parsed correctly.', () => {
        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test
        `));

        const possibleSyntaxTrees = grammar.parseRule(new GameRule('test'));

        expect(possibleSyntaxTrees).to.deep.equal({
            Object1: 'test'
        });
    });

    it('Only one possible parsed GST is allowed. Unambigious Parsings lead to logical errors and are thus forbidden.', () => {
        const grammarRuleParser = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test
            Object2:
                - test
        `));

        expect(() => grammarRuleParser.parseRule(new GameRule('test'))).to.throw(ParsingException);
    });

    it('References are being evaluated correctly.', () => {
        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - <<Object2>>?
            Object2:
                - test
        `));

        const possibleSyntaxTrees = grammar.parseRule(new GameRule('test?'));

        expect(possibleSyntaxTrees).to.deep.equal({
            ['Object1']: {
                ['Object2']: 'test'
            } 
        });
    });

    it('Named References are being used to name the parsed GST.', () => {
        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - <<ObjectA@Object2>> <<ObjectB@Object2>>
            Object2:
                - test
        `));

        const possibleSyntaxTrees = grammar.parseRule(new GameRule('test test'));

        expect(possibleSyntaxTrees).to.deep.equal({
            ['Object1']: {
                ['ObjectA']: 'test',
                ['ObjectB']: 'test'
            } 
        });
    });

    
    it('Users can provide custom parsing schemas.', () => {
        const rulebook = Rulebook.ofText(`
            Welcome to this non-sense game!

            {{abc.}}
            {{abc abc.}}
            {{abc def.}}
            {{abc abc def.}}
        `);

        const grammar = Grammar.ofRaw(cleanYamlString(`
            Rule1:
                - abc __Rule1__
                - abc
                - abc.
            Rule2:
                - __Rule1__ def.
        `), {referenceExtractor: {
            parse: (string) => string.match(new RegExp('(?<=__).+?(?=__)', 'gm')),
            reconstruct: (string) => `__${string}__`
        }});
        
        const parsedRules = grammar.parseRules(rulebook);

        expect(parsedRules).has.length(4);
        expect(parsedRules[0]).to.deep.equal({
            Rule1: 'abc.'
        });
        expect(parsedRules[1]).to.deep.equal({
            Rule1: {
                Rule1: 'abc.'
            }
        });
        expect(parsedRules[2]).to.deep.equal({
            Rule2: {
                Rule1: 'abc'
            }
        });
        expect(parsedRules[3]).to.deep.equal({
            Rule2: {
                Rule1: {
                    Rule1: 'abc'
                }
            }
        });
    });

    it('An initial Rule to start the parsing from can be provided.', () => {
        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test
            Object2:
                - test
        `));

        const possibleSyntaxTrees = grammar.parseRule(new GameRule('test'), 'Object2');

        //Object2 is ignored, because we only specify the search to happen on 'Object1'.
        //Thus, no Error is thrown here either.
        expect(possibleSyntaxTrees).to.deep.equal({
            ['Object2']: 'test'
        });
    });

    it('If an initial Rule is provided, it has to exist.', () => {
        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test
            Object2:
                - test
        `));

        expect(() => grammar.parseRule(new GameRule('test'), 'Object3')).to.throw(InvalidGrammarException);
    });

    it('Issue a warning if a Grammar Rule is not being used at all when parsing Game Rules.', (done) => {
        const testLogger: Logger = {
            error: () => '',
            warn: (message) => {
                console.log(message);
                done();
            },
            debug: () => '',
            info: () => ''
        };

        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test1
            Object2:
                - test2
        `), {logger: testLogger});

        const rulebook = Rulebook.ofText(`{{test1}}`);
        grammar.parseRules(rulebook);
    });

    it('Issue a warning if a Rule Definition is not being used at all when parsing Game Rules.', (done) => {
        const testLogger: Logger = {
            error: () => '',
            warn: (message) => {
                console.log(message);
                done();
            },
            debug: () => '',
            info: () => ''
        };

        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test1
                - test2
        `), {logger: testLogger});

        const rulebook = Rulebook.ofText(`{{test1}}`);
        grammar.parseRules(rulebook);
    });

    //A rule may not be defined, in case of <<Player>>: How does that work then?
    //As long as the "Code Behind" TODO: GIVE THIS A GOOD NAME
    //provides Code for that Token, it is valid?

    it('Warnings about non-visited Rules or Definitions are not issued if only a single Game Mechanic is parsed.', () => {
        const testLogger: Logger = {
            error: () => '',
            warn: (message) => {
                console.log(message);
                fail();
            },
            debug: () => '',
            info: () => ''
        };

        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test1
                - test2
        `), {logger: testLogger});

        grammar.parseRule('test1');
    });

    it('Each Game Mechanic has to be parseable.', () => {
        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test1
            Object2:
                - test2
        `));

        expect(() => grammar.parseRule(new GameRule('test3'))).to.throw(ParsingException);
    });

    it('A complex circular Reference that does not consume any additional Tokens is forbidden, because it leads to infinite self-reference.', () => {
        const grammar = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - <<Object2>>
            Object2:
                - <<Object1>>
        `));

        expect(() => grammar.parseRule('something something')).to.throw(ParsingException);
    });
});