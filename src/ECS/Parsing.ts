import { InvalidRuleException } from "../Exceptions/InvalidRuleException";
import { GrammarRules, Rule } from "./Types";

export class Parsing {
    public static parseAndCreate = (gameRules: string[], grammarRules: GrammarRules, mapping: {[name: string]: Function}): boolean => {
        gameRules.forEach((gameRule) => {
            //Find initial Rule to start evaluating from
            const possibleInitialRules = Parsing.findInitialRules(gameRule, grammarRules);

            if(possibleInitialRules.length > 1) console.log(`WARNING: The rule "${gameRule}" matches more than one possible InitialRule:\n\t${possibleInitialRules.join(`\n\t`)}`);
            if(possibleInitialRules.length == 0) throw InvalidRuleException.matchesNothing(gameRule);
        });
        
        return true;
    };

    public static isApplicable = (gameRule: string, grammarRule: string): Map<string, string> => {
        const extractingGroupNames: string[] = Parsing.extractGroupNames(grammarRule);

        grammarRule = grammarRule.replace(new RegExp('\\(\\([^\\)]+\\)\\)', 'g'), '(.+?)');
        const regex = new RegExp(`^${grammarRule}$`);

        const found = regex.exec(gameRule);

        console.log(`\tApplied the Regex-Rule "${regex}" to the Game Rule "${gameRule}".`);

        if(found != null) {
            console.log(`\t\t--> Found: ${found}`);
            const foundMap = new Map<string, string>();

            for(let i=0; i<found.length; i++) foundMap.set(extractingGroupNames[i], found[i]);

            return foundMap;
        } else {
            return new Map<string, string>();
        }
    };
    
    public static extractGroupNames = (grammarRule: string): string[] => {
        return grammarRule.match(new RegExp(`(?<=\\(\\()[^\\)]+(?=\\)\\))`, 'gm')) as string[];
    };

    public static findInitialRules = (gameRule: string, grammarRules: GrammarRules): Rule[] => {
        const possiblyApplicableRules = [...grammarRules.entries()].map(([ruleName, ruleDescriptions]) => {
            //Check, whether any ruleDescription is completely applicable to the current Rule

            const applicableRuleVariations = ruleDescriptions.filter((ruleDescription) => {
                return Parsing.isApplicable(gameRule, ruleDescription);
            });

            if(applicableRuleVariations.length > 0) console.log(`"${ruleName}" is a match!`);

            return applicableRuleVariations;
        })
        .filter((rule) => rule.length > 0);

        console.log(possiblyApplicableRules);

        console.log(`The Game Rule "${gameRule}" is possibly applicable to:\n${possiblyApplicableRules.map(([name, _]) => `\t${name}`)}`);
        return possiblyApplicableRules.map(([_, rule]) => rule);
    }
}