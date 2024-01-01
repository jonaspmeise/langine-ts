import { InvalidRulebookException } from "../Exceptions/InvalidRulebookException";
import { GameRule } from "./GameRule";

export class RulebookLoader {
    private ruleRegex: RegExp = new RegExp('{{(?<rule>[^}]+?)}}', 'gm');

    constructor(private rulebook: string) {}

    public parse = (customRuleRegex?: RegExp | string): GameRule[] => {
        //Return values.
        const gameRules: GameRule[] = [];

        //Set default parameters & parse RegExp.
        let ruleRegex = customRuleRegex ?? this.ruleRegex;
        if(typeof ruleRegex == 'string') ruleRegex = new RegExp(ruleRegex, 'gm');
        
        //Find all matches in the Rulebook.
        const regexResult = [...this.rulebook.matchAll(ruleRegex)];

        if(regexResult.length == 0) throw InvalidRulebookException.containsNoRules(
            this.rulebook,
            ruleRegex == this.ruleRegex ? this.ruleRegex : undefined
        );

        regexResult.forEach((result) => {
            const groups = result.groups ?? {};

            if(!('rule' in groups)) throw InvalidRulebookException.noRuleCaptureGroup(ruleRegex as RegExp   );

            gameRules.push(new GameRule(groups.rule));
        });
        
        return gameRules;
    };
}