import { Sentence } from "../../Sentence/Sentence";
import { TypeSentence } from "../../Sentence/TypeSentence";
import { GrammarRule } from "./GrammarRule";
import { ReplacementGrammarRule } from "./ReplacementGrammarRule";
import { TypeGrammarRule } from "./TypeGrammarRule";

export class GrammarRuleFactory {
    public static build = (input: Sentence, output: Sentence): GrammarRule<Sentence, Sentence> => {
        //If the Output is a Type, all the Input is consumed into the new Token and the Consumer Function called.
        if(output instanceof TypeSentence) return new TypeGrammarRule(input, output);
        
        //Otherwise: Shuffle around Tokens
        return new ReplacementGrammarRule(input, output);
    }
}