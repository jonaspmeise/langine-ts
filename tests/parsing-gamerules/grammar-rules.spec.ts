import { expect } from "chai";
import { GrammarRuleParserFactory } from "../../src/GrammarRuleParserFactory";
import { InvalidGrammarException } from "../../src/Exceptions/InvalidGrammarException";
import { cleanYamlString } from "../../src/Util";
import { GrammarRuleImplementation } from "../../src/GrammarRuleImplementation";

describe('Parsing GameRules.', () => {
/*
    Game Rules are the rules given in the Rulebook.
    These Rules have to be parsed into an AST, which is afterwards used to translate each rule into according Code.
    The AST is partly based on default implementations of Game Rules (game-agnostic, general English tokens and syntax),
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

    E.g. "You draw a Card." would be translated into to:
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
    
    it('The Grammar Rules have to be provided in a *.yaml file.', () => {
        const grammarRuleParser = GrammarRuleParserFactory.ofFile('./tests/parsing-gamerules/test-grammar.yaml');

        const rules = grammarRuleParser.getRules();

        expect([...rules.keys()]).to.deep.include('Consists');
        expect([...rules.keys()]).to.deep.include('Take');
    });

    it('There can be multiple Rule Sections within the same yaml. They are all registered.', () => {
        const grammarRuleParser = GrammarRuleParserFactory.ofRaw(cleanYamlString(`
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

        expect(grammarRuleParser.getRules()).to.have.length(3);

        expect(grammarRuleParser.getRule('Rule1')).to.have.length(3);
        expect(grammarRuleParser.getRule('Rule2')).to.have.length(2);
        expect(grammarRuleParser.getRule('Rule3')).to.have.length(1);
    });

    it('When a Grammar Rule appears in more than one Section of the Grammar Rules, only the highest one will be considered and registered.', () => {
        const grammarRuleParser = GrammarRuleParserFactory.ofRaw(cleanYamlString(`
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

        const rules = grammarRuleParser.getRules();
        
        expect(rules).to.have.length(3); //Rule 1 in the lower Section is overwritten
        expect(grammarRuleParser.getRule('Rule1')).to.be.not.undefined;
        expect(grammarRuleParser.getRule('Rule2')).to.be.not.undefined;
        expect(grammarRuleParser.getRule('Rule3')).to.be.not.undefined;

        const rule1 = grammarRuleParser.getRule('Rule1');
        expect(rule1).to.have.length(1); //Remember: only the top Rule definition!
        expect(rule1).to.deep.equal([new GrammarRuleImplementation('Implementation Nr.1', 'Rule1')]);
    });

    it('The Grammar Rules are only allowed to have a top level (Name) and string-Arrays beneath it (Rule Implementations).', () => {
        expect(() => GrammarRuleParserFactory.ofRaw(cleanYamlString(`
            Rule1:
                IllegalRule:
                - Implementation Nr.1
            Rule2:
                - Implementation Nr.1
                - Implementation Nr.2
        `))).to.throw(InvalidGrammarException);
    });

    it('The Name of a Grammar Rule should be uppercase. If it is not, a warning is issued.', async (done) => {
        GrammarRuleParserFactory.ofRaw(cleanYamlString(`
            rule1:
                - something
        `), 
        (warning) => {
            expect(warning).to.contain('Uppercase');
            console.log(`Received a warning: ${warning}`);
            done();
        });
    });

    it('There should be no duplicate Rule Implementations within a single Grammar Rule.', () => {
        expect(() => GrammarRuleParserFactory.ofRaw(cleanYamlString(`
            Rule1:
                - Implementation Nr. 1
                - Implementation Nr. 2
            Rule2:
                - Duplicate Implementation!
                - Duplicate Implementation!
        `))).to.throw(InvalidGrammarException);
    });

    it('A Rule Implementation can not reference its own Rule without consuming Tokens.', () => {
        expect(() => GrammarRuleParserFactory.ofRaw(cleanYamlString(`
            Rule1:
                - <<Rule1>>
                - Some other Tokens, blablabla...
        `))).to.throw(InvalidGrammarException);
    });

    it('Every Rule that is being referenced has to exist within the Grammar Rules.', () => {
        
    });

    it('An initial Grammar Rule can be given as an "entrypoint" to start the parsing from there. That Grammar Rule has to exist.', () => {

    });

    it('Every Game Rule has to be parseable by the given Grammar Rules.', () => {

    });

    it('If there is more than one Grammar Rule which parses a given Game Rule, issue a warning. Multiple parsings can lead to unpredictable behavior.', () => {

    });

    it('If there is a circular Grammar Rule reference that does not consume any Tokens during it, throw an Error.', () => {

    });

    //A rule may not be defined, in case of <<Player>>: How does that work then?
    //As long as the "Code Behind" TODO: GIVE THIS A GOOD NAME
    //provides Code for that Token, it is valid?

    it('Named Rule References are allowed, as long as the real referenced Rule exists.', () => {

    });

    it('Issue a warning if a Grammar Rule is not being used at all when parsing Game Rules.', () => {

    });

    it('A provided Grammar Rule is correctly transformed into a RegEx query, which can be applied when parsing the Game Rules.', () => {
        const rule1 = new GrammarRuleImplementation('<<Part1>> does something with <<Part2>>', 'Rule1');
        const rule2 = new GrammarRuleImplementation('Test something!', 'Rule1');
        const rule3 = new GrammarRuleImplementation('<<abc@Part>> does something with <<def@Part>>', 'Rule1');

        expect(rule1.queryRegex).to.deep.equal(new RegExp(`^(?<Part1>.+) does something with (?<Part2>.+)$`));
        expect(rule2.queryRegex).to.deep.equal(new RegExp(`^Test something!$`));
        expect(rule3.queryRegex).to.deep.equal(new RegExp(`^(?<abc>.+) does something with (?<def>.+)$`));
    });

    it('A named Reference to another Rule has to have a correct format.', () => {
        expect(() => GrammarRuleParserFactory.ofRaw(cleanYamlString(`
            Rule1:
                - <<Holder@Component@Component>> has something
            Component:
                - something
        `))).to.throw(InvalidGrammarException);

        expect(() => GrammarRuleParserFactory.ofRaw(cleanYamlString(`
            Rule1:
                - <<@Component>> has something
            Component:
                - something
        `))).to.throw(InvalidGrammarException);
    })
});