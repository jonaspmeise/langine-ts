import { ParsingError } from "../Error/ParsingError";
import { GrammarRule } from "../Grammar/Rules/GrammarRule";
import { Sentence } from "../Sentence/Sentence";
import { GameRule } from "./GameRule";
import { ParsingResult } from "./ParsingResult";
import { Rulebook } from "./Rulebook";

export class Langine {
    public readonly parsedResults: ParsingResult[] = [];

    constructor(
        private readonly rulebook: Rulebook,
        private readonly grammarRules: GrammarRule<Sentence, Sentence>[]
    ) {
        this.parsedResults = this.rulebook.rules.map((rule) => this.translate(rule));
    }

    //TODO: Tests für alles schreiben!
    public translate = (rule: GameRule): ParsingResult => {
        let result = new ParsingResult(rule.sentence);

        //TODO: Loop this until the parsing result is done
        while(!result.isDone()) {
            const applicableRule = this.findApplicableRule(result);

            if(applicableRule === undefined) throw ParsingError.couldNotBeParsed(result.getSentence());

            result = result.apply(applicableRule);
        }

        return result;
    };

    private findApplicableRule = (rule: ParsingResult): GrammarRule<Sentence, Sentence> | undefined => {
        return this.grammarRules.find((grammarRule) => grammarRule.getApplicableTokens(rule.getSentence()) !== null);
    };
}