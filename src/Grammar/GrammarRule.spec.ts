import { expect } from "chai";
import { GrammarRule } from "./GrammarRule";
import { Logger } from "../Logger/Logger";
import { InvalidRuleError } from "../Exceptions/InvalidRuleError";

describe('Grammar Rules.', () => {
    it('Mixed Sentence -> Mixed Sentence Rules require that References in the Output are also present in the Input.', () => {
        expect(() => GrammarRule.create('Draw a <<Card>>', 'Move a <<Card>> from the Deck to your <<Hand>>')).to.throw(InvalidRuleError);
    });

    //This behavior is possible, but not really useful in real-life situations
    it('Mixed Sentence -> Mixed Sentence Rules issue a warning if there are References in the Input, but that are not used in the Output.', function(done) {
        const logger: Logger = {
            warn: (_) => {done(); return undefined},
            error: (_) => undefined,
            info: (_) => undefined,
            debug: (_) => undefined
        };

        GrammarRule.create('Draw a <<Card>> from your <<Hand>>', 'Move a <<Card>>', logger);
    });
    
    it('Input and Output can not be equal. This would lead to infinite recursion calls.', () => {
        expect(() => GrammarRule.create('<<something>> else', '<<something>> else')).to.throw(InvalidRuleError);
        expect(() => GrammarRule.create('<<something>> else <<Token2>>', '<<something>> else <<Token2>>')).to.throw(InvalidRuleError);
        expect(() => GrammarRule.create('<<something@A>> else <<Token2@B>>', '<<something@A>> else <<Token2@B>>')).to.throw(InvalidRuleError);
    });

    it('Correct calls work.', () => {
        GrammarRule.create('<<something>> else', '<<something>> else matters');
        GrammarRule.create('<<something>> else', 'else <<something>>?');
    });
       
    it('Mixed Sentence -> Mixed Sentence Rules require that the References in the Output appear in the Input by their Names.', () => {
        expect(() => GrammarRule.create('<<Component@Whole>> consists of <<Component@Part>', '<<Whole>> references <<Component>>')).to.throw(InvalidRuleError); 
    });

    it('Mixed Sentence -> Mixed Sentence Rules can not create new References in the Output. They can only rearrange them.', () => {
        //If you want to do this, you should do it like this:
        //<<Component>> -> <<Entity>>  
        expect(() => GrammarRule.create('<<Component>> exists.', '<<Entity>> exists.')).to.throw(InvalidRuleError);
    });

    it('Mixed Sentence -> Mixed Sentence Rules may not use any named Tokens.', () => {
        //A named Reference is only necessary when the Output is a Type Sentence, because
        //the names are being used to call the Function of the type Sentence.
        expect(() => GrammarRule.create('<<Component@A>> exists.', '<<Component@A>> is spawned.')).to.throw(InvalidRuleError);
    });
    
    it('Named References can only appear in the Output, never in the Input.', () => {
        expect(() => GrammarRule.create('Some Input Token', '<<InputToken@CustomName>>')).to.throw(InvalidRuleError);
    });
});