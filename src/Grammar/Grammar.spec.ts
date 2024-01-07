import { expect } from "chai";

import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";
import { cleanYamlString } from "../Util";
import { GrammarRuleImplementation } from "./GrammarRuleImplementation";
import { Grammar } from "./Grammar";
import { Logger } from "../Logger/Logger";
import { GameRule } from "../Rulebook/GameRule";
import { ParsingException } from "../Exceptions/ParsingException";
import { Rulebook } from "../Rulebook/Rulebook";

describe('Parsing GameRules.', () => {
/*
    Game Rules are the rules given in the Rulebook.
    These Rules have to be parsed into an GST (Grammar Syntax Tree), which is afterwards used to translate each rule into according Code.
    The GST is partly based on default implementations of Game Rules (game-agnostic, general English tokens and syntax),
        and game-specific knowledge (certain keywords, etc.).

    Each Grammar Rule is provided in a *.yaml-Format.
    Each Grammar Rule has an identifier and 1+ multiple implementations, given in an array.

    Grammar Rule:
        - Rule Implementation #1
        - Rule Implementation #2
        - Rule Impleemntation #3
        - ....

    E.G. 

    Draw:
        - <<Player>> draw <<Card>>
        - <<Player>> draws <<Card>>
        - <<Player>> draws <<Card>> from <<Zone>>
    Card:
        - <<Identifier>> Card
        - Card
    Identifier:
        - <<SingleIdentifier>>
        - <<MultipleIdentifier>>
    SingleIdentifier:
        - a
        - an
        - the
    You:
        - you

    This is purely syntactical and not semantic. All semantic knowledge is included in another file.
    Essentially, a big JSON is produced for each parsed Game Rule.
    Parsing is done recursively, and each possible translation is matched.
    Its essentially Tree-DFS.

    E.g. "You draw a Card." would be translated into this GrammarSyntaxTree:
    {
        Draw: {
            Player: You,
            Card: {
                Identifier: SingleIdentifier
            }
        }
    }

    These Grammar Rules can be extended by the Player by e.g. adding additional grammar documents to the yaml.
    The yaml is shipped with the code to live-transform all rules.
    TODO: Return on the first rule found, or continue to query *all* rules?

    Tests:
    - The file has to be explicitly referenced or assumed to be called "grammar.yaml".
    - There is only allowed to be one level: Name + Implementations.
    - All Names should be uppercase. If not, issue a warning (not confirming to default).
    - There should be no duplicate possible rules for a given rule.
    - Issue warnings when a rule references itself.
    - If the name of a rule is referenced in a rule, throw an error if that rule does not exist.
    - potentially: allow an "entrypoint" rule to start the parsing from. Otherwise: Query all rules (takes longer).
    - If no rule is applicable, throw an Error.
    - If more than one rule is applicable, issue a warning (potential unexpected behavior).
    - If there is a circular reference, throw an error if no Tokens are consumed in the process. (or even better: Throw an exception, because the graph is not guaranteed to finish).
    */

    describe('Grammar specifications.', () => {
        it('There can be multiple Grammar Sections within the same yaml. They are all registered.', () => {
            const grammar = Grammar.ofRaw(cleanYamlString(`
                Rule1:
                    - Implementation Nr.1
                    - Implementation Nr.2
                    - <<Rule2>>
                Rule2:
                    - Implementation Nr.1
                    - Implementation Nr.2
                ---
                Rule3:
                    - Implementation Nr.1
            `));
    
            expect(grammar).to.have.length(3);
    
            expect(grammar.get('Rule1')).to.have.length(3);
            expect(grammar.get('Rule2')).to.have.length(2);
            expect(grammar.get('Rule3')).to.have.length(1);
        });
        
        it('When a Grammar Rule appears in more than one Section of the Grammar Rules, only the highest one will be considered and registered.', () => {
            const grammar = Grammar.ofRaw(cleanYamlString(`
                Rule1:
                    - Implementation Nr.1
                Rule2:
                    - Implementation Nr.1
                    - Implementation Nr.2
                ---
                Rule1:
                    - Implementation Nr.2
                    - Implementation Nr.3
                Rule3:
                    - Implementation Nr.1
            `));
            
            expect(grammar).to.have.length(3); //Rule 1 in the lower Section is overwritten
            expect(grammar.get('Rule1')).to.be.not.undefined;
            expect(grammar.get('Rule2')).to.be.not.undefined;
            expect(grammar.get('Rule3')).to.be.not.undefined;

            const rule1 = grammar.get('Rule1');
            expect(rule1).to.have.length(1); //Remember: only the top Rule definition!
            expect(rule1).to.deep.equal([new GrammarRuleImplementation('Implementation Nr.1', 'Rule1')]);
        });

        
        it('The Grammar Rules are only allowed to have a top level (Name) and string-Arrays beneath it (Rule Implementations).', () => {
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Rule1:
                    IllegalRule:
                    - Implementation Nr.1
                Rule2:
                    - Implementation Nr.1
                    - Implementation Nr.2
            `))).to.throw(InvalidGrammarException);
        });

        it('There should be no duplicate Rule Implementations within a single Grammar Rule.', () => {
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Rule1:
                    - Implementation Nr. 1
                    - Implementation Nr. 2
                Rule2:
                    - Duplicate Implementation!
                    - Duplicate Implementation!
            `))).to.throw(InvalidGrammarException);
        });

        it('The names of Grammar Rules may not contain sensitive symbols.', () => {
            // Spaces are not allowed!
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Object 1:
                    - test
            `))).to.throw(InvalidGrammarException);

            // Dots are not allowed!
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Object.1:
                    - test
            `))).to.throw(InvalidGrammarException);

            // '@' is not allowed!
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Object@:
                    - test
            `))).to.throw(InvalidGrammarException);
        });
    });

    describe('Rule specifications.', () => {
        it('The Name of a Rule Definition should be uppercase. If it is not, a warning is issued.', function (done) {
            const testLogger: Logger = {
                error: () => '',
                warn: (message) => {
                    done();
                },
                debug: () => '',
                info: () => ''
            };
    
            Grammar.ofRaw(cleanYamlString(`
                rule1:
                    - something
            `), {logger: testLogger});
        });

        it('A Rule Definition can not reference its own Rule without consuming Tokens.', () => {
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Rule1:
                    - <<Rule1>>
                    - Some other Tokens, blablabla...
            `))).to.throw(InvalidGrammarException);
        });

        it('Every Rule Definition that is being referenced by its name has to exist within the Grammar Rules.', () => {
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Rule1:
                    - <<Rule2>>
                    - Some other Tokens, blablabla...
                Rule2:
                    - "<<Rule1>>: <<Rule2>>"
                    - hehe
                Rule3:
                    - "<<Rule2>>: <<NonExistingRule>>"
            `))).to.throw(InvalidGrammarException);
        });

        it('All References within a single Rule Implementation need to have a unique Identifier.', () => {
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Rule1:
                    - <<Rule2>> <<Rule2>>
                Rule2:
                    - hehe
            `))).to.throw(InvalidGrammarException);
        });

        it('Rule Implementations can escape yaml-specific tokens (e.g. ":") by quoting the entire Rule Implementation. These Quotes are ignored.', () => {
            const grammar = Grammar.ofRaw(cleanYamlString(`
                Rule1:
                    - "<<Rule1>> abc"
                Rule2:
                    - <<Rule1>> abc
            `));
    
            expect(grammar).has.length(2);
            expect(grammar.get('Rule1')).to.deep.equal(grammar.get('Rule2'));
        });

        it('If there is a circular Grammar Rule reference that does not consume any Tokens during it, throw an Error.', () => {
            expect(() => Grammar.ofRaw(cleanYamlString(`
                Win:
                    - <<Player>> win
                    - <<Player>> wins
                Player:
                    - You
                    - <<Player>>
            `))).to.throw(InvalidGrammarException);
        });
    });

    describe('Parsing specification.', () => {
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

        it('A provided Grammar Rule is correctly transformed into a RegEx query, which can be applied when parsing the Game Rules.', () => {
            const rule1 = new GrammarRuleImplementation('<<Part1>> does something with <<Part2>>', 'Rule1');
            const rule2 = new GrammarRuleImplementation('Test something!', 'Rule1');
            const rule3 = new GrammarRuleImplementation('<<abc@Part>> does something with <<def@Part>>', 'Rule1');

            expect(rule1.queryRegex).to.deep.equal(new RegExp(`^(?<Part1>.+) does something with (?<Part2>.+)$`));
            expect(rule2.queryRegex).to.deep.equal(new RegExp(`^Test something!$`));
            expect(rule3.queryRegex).to.deep.equal(new RegExp(`^(?<abc>.+) does something with (?<def>.+)$`));
        });
    });


    it('If there is more than one Grammar Rule which parses a given Game Rule, issue a warning. Multiple parsings can lead to unpredictable behavior.', () => {

    });

    //A rule may not be defined, in case of <<Player>>: How does that work then?
    //As long as the "Code Behind" TODO: GIVE THIS A GOOD NAME
    //provides Code for that Token, it is valid?

    it('Issue a warning if a Grammar Rule is not being used at all when parsing Game Rules.', () => {

    });

    it('A named Reference to another Rule has to have a correct format.', () => {
        expect(() => Grammar.ofRaw(cleanYamlString(`
            Rule1:
                - <<Holder@Component@Component>> has something
            Component:
                - something
        `))).to.throw(InvalidGrammarException);

        expect(() => Grammar.ofRaw(cleanYamlString(`
            Rule1:
                - <<@Component>> has something
            Component:
                - something
        `))).to.throw(InvalidGrammarException);
    });

    it('Each Game Mechanic has to be parseable.', () => {
        const grammarRuleParser = Grammar.ofRaw(cleanYamlString(`
            Object1:
                - test1
            Object2:
                - test2
        `));

        expect(() => grammarRuleParser.parseRule(new GameRule('test3'))).to.throw(ParsingException);
    });

    //TODO: No circular references
    //Issue warning if certain Nodes have not been visited
    //TODO: Nudge the Player to implement own GameRule -> GrammarSyntaxTree tests; should be easily suppliable due to the string -> JSON-Format.

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
    });
});