import { GameRule } from "../Rulebook/GameRule";
import { Rulebook } from "../Rulebook/Rulebook";
import { ParsingResult } from "./ParsingResult";
import { InvalidGrammarError } from "../Exceptions/InvalidGrammarError";

import fs from 'fs';
import { ParsingError } from "../Exceptions/ParsingError";
import { Logger } from "../Logger/Logger";
import { DefaultLogger } from "../Logger/DefaultLogger";
import { GrammarRule } from "./GrammarRule";
import { Token } from "./Tokens";

interface GrammarContract {
    parse(rulebook: Rulebook): GameRule;
    parse(rule: GameRule): GameRule;
    parseStep(rule: GameRule): ParsingResult;
}

export class Grammar extends Map<string, GrammarRule> implements GrammarContract {

    constructor(rules: Map<string, GrammarRule>) {
        super(rules);
    }

    public parseStep = (rule: GameRule | ParsingResult): ParsingResult => {
        let text: string;
        let history: string[] = [];

        //Change the setup depending on the type of the Input
        if (rule instanceof GameRule) {
            text = rule.rule;
        } else {
            text = rule.text;
            history = rule.history;
        }

        const ruleToApply = [...this.values()].find((rule) => {
            const tokens = new RegExp(rule.getInput().text, 'g');
            const match = text.match(tokens);

            return match !== null;
        });

        //Validate that we found a rule at all
        if(ruleToApply === undefined) throw ParsingError.noApplicableRuleFound(text);

        const appliedRule = text.replaceAll(ruleToApply.getInput().text, ruleToApply.getOutput().text);

        //...and that we will not cause an infinite loop by revisiting already past-seen states
        if(history.includes(appliedRule)) throw ParsingError.infiniteSelfReference(text, ruleToApply, history);


        return {text: appliedRule, history: history.concat(appliedRule)};
    };

    public parse(rule: GameRule): GameRule;
    public parse(rulebook: Rulebook): GameRule;
    public parse(rules: Rulebook | GameRule): GameRule {
        if(!Array.isArray(rules)) rules = [rules];

        rules.map((rule) => rule.rule).forEach((context) => {
            const results: string[] = [];
            
            while(true) {
                let next = context;

                [...this.values()].forEach((rule) => {
                    const regex = new RegExp(rule.getInput().text, 'g');
                    const matches = next.match(regex);
        
                    if(matches === null) return;
        
                    next = next.replaceAll(regex, rule.getOutput().text);
                    results.push(next);
                });
        
                if(next === context) throw Error(`End!\n${results.join('\n')}`);

                context = next;
            }
        });

        return new GameRule('abc');
    };

    public static ofFile = (path: string): Grammar => {
        return Grammar.ofText(fs.readFileSync(path, 'utf-8'));
    };

    public static ofText = (text: string, logger: Logger = new DefaultLogger()): Grammar => {
        const rules: Map<string, GrammarRule> = new Map();

        const texts = text.match(new RegExp('^(?!\\s*#).+$', 'gm'))
        if(texts == null) throw InvalidGrammarError.noRulesFound(undefined);
        
        texts.forEach((line) => {
            line = line.trim();
            if(line.length == 0) return;

            const parts = line.trim().split(' -> ');

            if(parts.length == 2) {
                const [key, value] = parts;

                const subkeys = key.split(' | ');

                //Save all found rules, potentially constructed from a combinated rule
                subkeys.forEach((subkey) => {
                    //A Rule with that given Input is already defined?
                    if(rules.has(subkey)) {
                        logger.warn(`A Rule for the Input "${subkey}" is already defined! Consider adjusting your Grammar so that each Input is only used once.`)
                    }

                    rules.set(subkey, new GrammarRule(new Token(subkey), new Token(value)));
                });
            } else {
                console.log(parts);
                throw Error('!!!');
            }
        });

        return new Grammar(rules);
    };
}