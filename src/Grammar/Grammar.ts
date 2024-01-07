import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";
import { ParsingException } from "../Exceptions/ParsingException";
import { GrammarRuleImplementation } from "./GrammarRuleImplementation";
import { GrammarRuleName } from "./GrammarRuleName";
import { GrammarSyntaxTree } from "./GrammarSyntaxTree";
import { GameRule } from "../Rulebook/GameRule";
import { findDuplicates } from "../Util";
import { Rulebook } from "../Rulebook/Rulebook";
import { GrammarOptions, defaultGrammarOptions } from "./GrammarOptions";

import fs from 'fs';
import yaml from 'js-yaml';

export class Grammar extends Map<string, GrammarRuleImplementation[]>{
    constructor(
        map: Map<string, string[]>,
        private options: Partial<GrammarOptions> = defaultGrammarOptions
    ) {
        super();

        [...map.entries()].forEach(([name, implementations]) => {
            this.set(
                new GrammarRuleName(name, this.options.logger),
                implementations.map((implementation) => new GrammarRuleImplementation(implementation, name, this.options)));
        });

        this.staticallyCheckMap();
    }

    /*
        Checks, whether all defined Rule References even exist.
    */
    private staticallyCheckMap = (): void => {
        this.forEach((ruleImplementations) => {
            ruleImplementations.forEach((ruleImplementation) => {
                ruleImplementation.keyReferences.forEach((keyReference) => {
                    //TODO: Native rules? how to implement them? How to map general stuff as Component, Player, etc.. into these rules?
                    if(!this.has(keyReference)) throw InvalidGrammarException.nonExistingIdentifier(keyReference, this.keys());
                });
            });
        });
    };

    public override set = (name: string | GrammarRuleName, ruleImplementations: GrammarRuleImplementation[]): this => { 
        const grammarRule = (name instanceof GrammarRuleName) ? name : new GrammarRuleName(name, this.options.logger);
        
        super.set(grammarRule.name, ruleImplementations);
        return this;
    };

    public override get = (name: string | GrammarRuleName): GrammarRuleImplementation[] => {
        if(name instanceof GrammarRuleName) name = name.name;

        if(!this.has(name)) throw InvalidGrammarException.ruleDoesNotExist(name, [...this.keys()]);

        return super.get(name)!;
    };

    public override has = (name: string | GrammarRuleName): boolean => {
        if(name instanceof GrammarRuleName) name = name.name;

        return super.has(name);
    };

    //TODO: initialRuleName is used to "hand in" named objects, so that we return certain objects as things
    //TODO: Otherwise, we just return the token and then add the name from the parent call...?
    //TODO: But if there is no parent (we just call a certain rule against our grammar rules), what should be returned? the natural name???
    public parseRule = (rule: (GameRule | string), initialRule?: string, initialRuleName?: string): GrammarSyntaxTree => {
        const ruleToParse = (rule instanceof GameRule) ? rule.rule : rule;

        const syntaxTree = this.recParseRule(ruleToParse, initialRule, initialRuleName);

        if(!syntaxTree) throw ParsingException.couldNotParse(ruleToParse);

        return syntaxTree;
    }
    
    private recParseRule = (rule: string, initialRule?: string, initialRuleName?: string): GrammarSyntaxTree | null => {
        const possibleSyntaxTrees: GrammarSyntaxTree[] = [];
        
        let rulesToQuery: [string, GrammarRuleImplementation[]][] = [...this.entries()];

        if(initialRule) {
            //FIXME: Double-Array because there is only one Rule, but we still iterate over all entries
            //FIXME: Probably better - expose querying into another method (even though we already do this here???)
            rulesToQuery = [[initialRule, this.get(initialRule)]];
        }

        rulesToQuery.forEach(([ruleName, ruleImplementations]) => {
            ruleImplementations.forEach((ruleImplementation) => {
                //check, whether the rule implementation holds
                const match = ruleImplementation.queryRegex.exec(rule);

                if(match) {
                    //resolve potential references that the rule holds
                    if(ruleImplementation.keyReferences.size > 0) {
                        //resolve each reference individually, recursively
                        const resolvedSubtrees = [...ruleImplementation.keyReferences.entries()].map(([referenceName, referenceType]) => {
                            //TODO: Did we validate this before or do we have to do it here again?

                            const subTextToParse = match.groups![referenceName];
                            const possibleSubTree = this.recParseRule(subTextToParse, referenceType, referenceName);
                            
                            //FIXME: Remove 0 here?
                            return possibleSubTree;
                        });

                        if(!resolvedSubtrees.every((subtree) => subtree !== null)) return;

                        possibleSyntaxTrees.push({
                            [initialRuleName ?? ruleName]: (resolvedSubtrees as GrammarSyntaxTree[]).reduce((arr, cur) => {
                                    return {...arr, ...cur};
                                }, {})
                        });
                    } else {
                        //simply add the consumed token
                        possibleSyntaxTrees.push({[initialRuleName ?? ruleName]: rule});
                    }
                }
            });
        });

        if(possibleSyntaxTrees.length > 1) throw ParsingException.moreThanOneMatch(rule, possibleSyntaxTrees);

        return possibleSyntaxTrees.length == 1 ? possibleSyntaxTrees[0] : null;
    };

    public parseRules = (rulebook: Rulebook): GrammarSyntaxTree[] => {
        return rulebook.map((rule) => {
            const rules = this.parseRule(rule)
            return rules;
        });
    };

    public static ofFile = (filepath: string, options?: Partial<GrammarOptions>): Grammar => {
        return Grammar.ofRaw(fs.readFileSync(filepath, 'utf8'), options);
    };

    public static ofRaw = (text: string, options?: Partial<GrammarOptions>): Grammar => {
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

        return new Grammar(map, options);
    };
}