import { InvalidGrammarError } from "../Error/InvalidGrammarError";
import { DefaultLogger } from "../Logger/DefaultLogger";
import { Logger } from "../Logger/Logger";
import { Sentence } from "../Sentence/Sentence";
import { SentenceFactory } from "../Sentence/SentenceFactory";
import { GrammarRule } from "./Rules/GrammarRule"
import { GrammarRuleFactory } from "./Rules/GrammarRuleFactory";

export class Grammar {
    constructor(public readonly rules: GrammarRule<Sentence, Sentence>[], private readonly logger: Logger = new DefaultLogger()) {
        if(rules.length === 0) this.logger.warn('You did not provide any Grammar Rules! Please consider checking your setup.');
    }

    public static from = (text: string): Grammar => {
        const rules: GrammarRule<Sentence, Sentence>[] = text.split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0) //ignore empty lines
            .filter((line) => !line.startsWith('#')) //ignore comments
            .map((line) => {
                const split = line.split(' -> ');

                if(split.length !== 2) throw InvalidGrammarError.wrongRuleFormat(line);

                return GrammarRuleFactory.build(
                    SentenceFactory.parse(split[0]),
                    SentenceFactory.parse(split[1])
                );
            });

        return new Grammar(rules);
    };
}