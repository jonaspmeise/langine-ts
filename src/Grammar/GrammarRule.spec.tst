
/*
    The Grammar Rules primarly use the Type unknown,
    because these functions are implemented in Javascript and read dynamically during runtime from a given .js file.
*/

import { expect } from "chai";
import { GrammarRule } from "./GrammarRule";
import { InvalidRuleError } from "../Exceptions/InvalidRuleError";
import { Logger } from "../Logger/Logger";
import { Sentence } from "./Sentence";

/*There are three possible cases of what Grammar Rules are:
    1.  Sentence -> Sentence
            e.g. "Player" -> "player"
        - For purely orthographical changes.

    2.  Mixed -> Mixed
            e.g. "Draw a <<Card>>" -> "Move <<Card>> to your Hand."
            e.g. "Conquer: <<Action>>" -> "When this conquers a Lane, <<Action>>".
        - Encoding of Domain-specific Language (e.g. "Draw") into Primitives.
        - Input and Output reference the same Types with names; they are simply "handed through".
        - The Input and Output references have to be unique or have an unique name at least.
        - @After parsing the grammar; check whether all Types exist.

    3.  Sentence -> Type
            e.g. "consists out of" | "is constructed of" -> "<<consists>>"
        - useful for having syntactical invariants of semantical Sentences

    4.  Mixed -> Type
            e.g. "<<Component@A>> <<consists>> <<Component@B>> -> <<ConsistsRule>>"
        - combines parsed Types into a new Type.
        - The Input has to have unique references. The Function of this Rule can consume all references from the Input (in addition to Standard values, such as Game).

    5.  Type -> Type
            e.g. <<ConsistsRule>> -> <<StaticRule>>
            e.g. <<StaticRule>> -> <<Rule>>
        - Can be used for a "Component-like", inherited handling of Types.
        - E.g., all Rules that state "A consists out of B" can be handled as StaticRules, because they describe the state of something and don't reference an Action.
*/

describe('Grammar Rules.', () => {
    it('Mixed Sentence -> Mixed Sentence Rules require the Output to reference Types present in the Input.', () => {
        expect(() => GrammarRule.create('Draw a <<Card>>', 'Move a <<Card>> from the Deck to your <<Hand>>')).to.throw(InvalidRuleError);
    });

    //This behavior is possible, but not really useful in real-life situations
    it('Mixed Sentence -> Mixed Sentence Rules issue a warning if there are Types which are referenced in the Input, but not in the Output.', function(done) {
        const logger: Logger = {
            warn: (_) => {done(); return undefined},
            error: (_) => undefined,
            info: (_) => undefined,
            debug: (_) => undefined
        };

        GrammarRule.create('Draw a <<Card>> from your <<Hand>>', 'Move a <<Card>>', logger);
    });

    it('Input and Output can not be equal.', () => {
        expect(() => GrammarRule.create('<<something>> else', '<<something>> else')).to.throw(InvalidRuleError);
    });
       
    it('Mixed Sentence -> Mixed Sentence Rules require that the Types in the Output reference the Types in the Input by their Names.', () => {
        expect(() => GrammarRule.create('<<Component@Whole>> consists of <<Component@Part>', '<<Whole>> references <<Component>>')).to.throw(InvalidRuleError); 
    });

    it('Mixed Sentence -> Mixed Sentence Rules can not reference different Types with the same Name.', () => {
        expect(() => GrammarRule.create('<<Component@A>> exists.', '<<Entity@A>> is being referenced.')).to.throw(InvalidRuleError); 
    });

    it('Is applied correctly to target Sentences.', () => {
        const sentence = new Sentence('This is a test.');
        const rule = new GrammarRule(new Sentence('test'), new Sentence('<<TestToken>>'));

        const result = rule.apply(sentence).sentence;
        expect(result.tokens).to.have.length(1);

        const token = [...result.tokens.values()][0]
        expect(token.name).to.equal('TestToken');
        expect(token.type).to.equal('TestToken');
    });
});