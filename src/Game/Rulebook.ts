import { InvalidRulebookError } from "../Error/InvalidRulebookError";
import { GameRule } from "./GameRule";

export class Rulebook {
    constructor(public readonly rules: GameRule[]) {
        if(rules.length === 0) throw InvalidRulebookError.noRulesFound();
    }

    public static from = (text: string): Rulebook => {
        const matches = text.match(new RegExp('(?<={{).+?(?=}})', 'gms')) ?? [];

        if(matches === null) throw InvalidRulebookError.noRulesFound(text);

        const rules = matches
            .map((rule: string) => rule.trim())
            .filter((rule) => rule.length > 0)
            .map((rule) => GameRule.from(rule));

        return new Rulebook(rules);
    };
}