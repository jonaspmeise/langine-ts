import { GameRule } from "../Rulebook/GameRule";
import { Rulebook } from "../Rulebook/Rulebook";
import { ParsingResult } from "./ParsingResult";
import { InvalidGrammarError } from "../Exceptions/InvalidGrammarError";

import fs from 'fs';
import { ParsingError } from "../Exceptions/ParsingError";
import { Logger } from "../Logger/Logger";
import { DefaultLogger } from "../Logger/DefaultLogger";
import { GrammarRule } from "./GrammarRule";
import { Sentence } from "./Sentence";

interface GrammarContract {
    parse(rulebook: Rulebook): ParsingResult[];
    parse(rule: GameRule): ParsingResult;
    parseStep(rule: GameRule): ParsingResult;
}

export class Grammar extends Map<string, GrammarRule> implements GrammarContract {

    constructor(rules: Map<string, GrammarRule>) {
        super(rules);
    }

    public parseStep = (input: GameRule | ParsingResult): ParsingResult => {
        let history: string[] = [];

        //Change the setup depending on the type of the Input
        let sentence: Sentence = (input instanceof GameRule) ? new Sentence(input.text) : input.sentence; 

        //TODO: This is only preliminary. Needs logic.
        //if(rule.text === '<<Rule>>') return {sentence: rule, history: history};

        //FIXME: Remvove new Sentence(...)
        const ruleToApply = [...this.values()].find((grammarRule) => grammarRule.isApplicable(sentence));

        //Validate that we found a rule at all
        if(ruleToApply === undefined) throw ParsingError.noApplicableRuleFound(sentence, history);

        //There might be an Error with the Rule, where replacing the found Input with the Output did not work.
        return ruleToApply.apply(sentence, history);
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
            if(newResult.sentence.definition === currentResult.sentence.definition) return newResult;

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

                    rules.set(subkey, new GrammarRule(new Sentence(subkey), new Sentence(value)));
                });
            } else {
                console.log(parts);
                throw Error('!!!');
            }
        });

        return new Grammar(rules);
    };
}