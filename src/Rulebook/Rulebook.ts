import { InvalidRulebookException } from "../Exceptions/InvalidRulebookException";
import { GameRule } from "./GameRule";
import fs from 'fs';

export class Rulebook extends Array<GameRule>{
    constructor(rules: GameRule[] | number) {
        if(Array.isArray(rules)) {
            super(...rules);
        } else {
            super(rules);
        }
    }

    public static ofFile = (filepath: string): Rulebook => {
        try { 
            return Rulebook.ofText(fs.readFileSync(filepath, 'utf8'));
        } catch(error) {
            throw InvalidRulebookException.fileError(filepath);
        }
    };

    public static ofText = (
        text: string, 
        ruleExtractor: (text: string) => string[] = (text: string) => text.match(new RegExp(`(?<=\{\{)(?<rule>.+?)(?=\}\})`, 'gms')) ?? []
    ): Rulebook => {
        const extractedRules = ruleExtractor(text);

        if(extractedRules.length == 0) throw InvalidRulebookException.containsNoRules(text);

        return new Rulebook(extractedRules.map((rule) => new GameRule(rule)));
    };

    public static ofRules = (rules: GameRule[]): Rulebook => {
        return new Rulebook(rules);
    };
}