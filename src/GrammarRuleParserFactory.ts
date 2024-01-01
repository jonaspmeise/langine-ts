import { GrammarRuleParser } from "./GrammarRuleParser";
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { InvalidGrammarException } from "./Exceptions/InvalidGrammarException";
import { findDuplicates } from "./Util";

export class GrammarRuleParserFactory {
    public static ofFile = (filepath: string): GrammarRuleParser => {
        return GrammarRuleParserFactory.ofRaw(fs.readFileSync(filepath, 'utf8'));
    };

    public static ofMap = (
        map: Map<string, string[]>,
        warningConsumer: (warning: string) => void = (warning) => console.log(`WARNING: ${warning}`)
    ): GrammarRuleParser => {
        return new GrammarRuleParser(map, warningConsumer);
    }

    public static ofRaw = (
        text: string,
        warningConsumer: (warning: string) => void = (warning) => console.log(`WARNING: ${warning}`)
    ): GrammarRuleParser => {
        const yamlDocuments = yaml.loadAll(text) as any[];

        const map: Map<string, string[]> = new Map();

        //We reverse all Documents, so that our uppermost Documents are being loaded last
        //Thus, if we overwrite properties, always the uppermost definition is being taken.
        yamlDocuments.reverse().forEach((yamlDocument) => {
            
            //Validate that the read file is a "flat" yaml:
            //Top-level only contains Grammar Rule Names
            //and each Name contains an array of Rule Implementations (strings)
            Object.entries(yamlDocument).forEach(([name, implementations]) => {
                if(!Array.isArray(implementations)) throw InvalidGrammarException.ruleHasNoChildArray(name);

                if(implementations.some((implementation) => typeof implementation != 'string')) throw InvalidGrammarException.implementationIsNotString(implementations);
                
                //Check for duplicate Rule Implementations
                const duplicateRules = findDuplicates(implementations as string[]); 
                if(duplicateRules.length > 0) throw InvalidGrammarException.duplicateRule(name, duplicateRules);

                //LOG: if(map.get(name)) console.log(`The Rule "${name}" is being overwritten!`);
                map.set(name, implementations);
            });
        });

        return new GrammarRuleParser(map, warningConsumer);
    }
}