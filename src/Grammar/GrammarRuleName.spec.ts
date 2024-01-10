import { expect } from "chai";
import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";
import { GrammarRuleName } from "./GrammarRuleName";

describe('Grammar Rule Names.', () => {
    it('The names of Grammar Rules may not contain sensitive symbols.', () => {
        // Spaces are not allowed!
        expect(() => new GrammarRuleName('Object 1')).to.throw(InvalidGrammarException);
    
        // Dots are not allowed!
        expect(() => new GrammarRuleName('Object.1')).to.throw(InvalidGrammarException);
    
        // '@' is not allowed!
        expect(() => new GrammarRuleName('Object@')).to.throw(InvalidGrammarException);

        // works
        new GrammarRuleName('Object_2');
    });
});
