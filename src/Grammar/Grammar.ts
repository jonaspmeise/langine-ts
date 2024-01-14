import { GameRule } from "../Rulebook/GameRule";
import { Rulebook } from "../Rulebook/Rulebook";
import { ParsingResult } from "./ParsingResult";

import fs from 'fs';

interface GrammarContract {
    parseRules(rulebook: Rulebook): void;
    parseRule(rule: GameRule): undefined;
    applyRules(text: string | ParsingResult): ParsingResult;
}

export class Grammar extends Map<string, string> implements GrammarContract {

    constructor(rules: Map<string, string>) {
        super(rules);
    }

    parseRule(rule: GameRule): undefined {
        throw new Error(rule.toString());
    }
    applyRules(text: string | ParsingResult): ParsingResult {
        throw new Error(text.toString());
    }

    public parseRules = (rulebook: Rulebook): void => {
        rulebook.map((rule) => rule.rule).forEach((context) => {
            const results: string[] = [];
            
            while(true) {
                let next = context;

                [...this.entries()].forEach(([tokens, result]) => {
                    const regex = new RegExp(tokens, 'g');
                    const matches = next.match(regex);
        
                    if(matches === null) return;
        
                    next = next.replaceAll(regex, result);
                    results.push(next);
                });
        

                if(next === context) throw Error(`End!\n${results.join('\n')}`);

                context = next;
            }
        });
    };

    public static ofFile = (path: string): Grammar => {
        return Grammar.ofText(fs.readFileSync(path, 'utf-8'));
    };

    public static ofText = (text: string): Grammar => {
        const rules: Map<string, string> = new Map<string, string>();

        const texts = text.match(new RegExp('^[^#\n].+$', 'gm'))
        if(texts == null) throw Error('!!!');
        
        texts.forEach((line) => {
                const parts = line.split(' -> ');

                if(parts.length == 2) {
                    const [key, value] = parts;

                    const subkeys = key.split(' | ');

                    subkeys.forEach((subkey) => rules.set(subkey, value));
                } else {
                    console.log(parts);
                    throw Error('!!!');
                }
            });

        return new Grammar(rules);
    };
}