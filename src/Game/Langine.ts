import { GrammarRule } from "../Grammar/Rules/GrammarRule";
import { Sentence } from "../Sentence/Sentence";
import { GameRule } from "./GameRule";
import { Rulebook } from "./Rulebook";

export class Langine {
    constructor(
        private readonly rulebook: Rulebook,
        private readonly grammarRules: GrammarRule<Sentence, Sentence>[]
    ) {
        //Try and parse each rule
        //TODO: Write Code
        console.log(!!this.rulebook);
        console.log(!!this.grammarRules);
        console.log(!!this.findRule);
    }

    private findRule = (rule: GameRule, grammarRules: GrammarRule<Sentence, Sentence>[]): GrammarRule<Sentence, Sentence> | undefined => {
        return grammarRules.find((grammarRule) => grammarRule.canBeAppliedTo(rule.sentence));
    };
}