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
    parse(rulebook: Rulebook): ParsingResult[];
    parse(rule: GameRule): ParsingResult;
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
            const tokens = rule.getInput().regex;
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

    public parse(rule: GameRule): ParsingResult;
    public parse(rulebook: Rulebook): ParsingResult[];
    public parse(rules: Rulebook | GameRule): ParsingResult | ParsingResult[] {
        if(Array.isArray(rules)) return rules.map((rule) => this.parse(rule));

        let newResult: ParsingResult;
        let currentResult: ParsingResult = this.parseStep(rules);

        while(true) {
            newResult = this.parseStep(currentResult);

            //Stop searching if we finished parsing all Rules.
            if(newResult === currentResult) return newResult;

            currentResult = newResult;
        };
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