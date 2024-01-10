import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";
import { ParsingException } from "../Exceptions/ParsingException";
import { GrammarRuleDefinition } from "./GrammarRuleDefinition";
import { GrammarRuleName } from "./GrammarRuleName";
import { GrammarSyntaxTree } from "./GrammarSyntaxTree";
import { GameRule } from "../Rulebook/GameRule";
import { findDuplicates } from "../Util";
import { Rulebook } from "../Rulebook/Rulebook";
import { GrammarOptions, injectWithDefaultValues } from "./GrammarTypes";

import fs from 'fs';
import yaml from 'js-yaml';
import { StackEntry } from "../ECS/Types";

export class Grammar extends Map<string, GrammarRuleDefinition[]>{
    private options: GrammarOptions;
    //For each Grammar Rule, we keep track of with what Game Rule we called this Node.
    //If we encounter a Rule there that we already tried to parse, we got stuck in an infinite self-reference!
    constructor(
        map: Map<string, string[]>,
        options?: Partial<GrammarOptions>
    ) {
        super();
        this.options = injectWithDefaultValues(options);

        [...map.entries()].forEach(([name, implementations]) => {
            this.set(
                new GrammarRuleName(name, this.options.logger),
                implementations.map((implementation) => new GrammarRuleDefinition(implementation, name, options)));
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

    public override set = (name: string | GrammarRuleName, ruleImplementations: GrammarRuleDefinition[]): this => { 
        const grammarRule = (name instanceof GrammarRuleName) ? name : new GrammarRuleName(name, this.options.logger);
        
        super.set(grammarRule.name, ruleImplementations);
        return this;
    };

    public override get = (name: string | GrammarRuleName): GrammarRuleDefinition[] => {
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
    };

    public parseRules = (rulebook: Rulebook): GrammarSyntaxTree[] => {
        const gsts = rulebook.map((rule) => {
            const rules = this.parseRule(rule)
            return rules;
        });

        //Analyze, which Rules and which Definitions we did not parse;
        this.analyzeUsage();

        return gsts;
    };

    private analyzeUsage = (): void => {
        const notUsedRules: {rule: string, definitions: GrammarRuleDefinition[]}[] = [];

        [...this.entries()].forEach(([ruleName, definitions]) => {
            const notUsedDefinitions = definitions.filter((definition) => !definition.wasUsed());

            if(notUsedDefinitions.length > 0) notUsedRules.push({rule: ruleName, definitions: notUsedDefinitions});
        });

        if(notUsedRules.length > 0) {
            this.options.logger.warn(`
            Some Grammar Rules and Definitions were not used when parsing the Game Rules.
            Consider removing these or refactoring your Grammar Rules:
            
            ${notUsedRules.map((entry) => `${entry.rule}:
                ${entry.definitions.map((definition) => `- ${definition.rule}`).join(`\t\n`)}`)
                .join(`\n`)}`);
        }
    };
    
    private recParseRule = (rule: string, initialRule?: string, initialRuleName?: string, stack: StackEntry[] = []): GrammarSyntaxTree | null => {
        const possibleSyntaxTrees: GrammarSyntaxTree[] = [];
        
        let rulesToQuery: [string, GrammarRuleDefinition[]][] = [...this.entries()];

        if(initialRule) {
            //FIXME: Double-Array because there is only one Rule, but we still iterate over all entries
            //FIXME: Probably better - expose querying into another method (even though we already do this here???)
            rulesToQuery = [[initialRule, this.get(initialRule)]];
        }

        rulesToQuery.forEach(([ruleName, ruleImplementations]) => {
            //Check for infinite self-reference loop by checking whether we already tried to parse this entry before in this path.
            const currentVisitation: StackEntry = {rule: ruleName, text: rule};

            if(stack.find((entry) => entry.rule === currentVisitation.rule && entry.text === currentVisitation.text)) throw ParsingException.infiniteSelfReference(currentVisitation, stack);

            ruleImplementations.forEach((ruleImplementation) => {
                //check, whether the rule implementation holds
                const match = ruleImplementation.queryRegex.exec(rule);

                if(match) {
                    //resolve potential references that the rule holds
                    if(ruleImplementation.keyReferences.size > 0) {
                        //resolve each reference individually, recursively
                        const resolvedSubtrees = [...ruleImplementation.keyReferences.entries()].map(([referenceName, referenceType]) => {
                            const subTextToParse = match.groups![referenceName];
                            const possibleSubTree = this.recParseRule(subTextToParse, referenceType, referenceName, [...stack, currentVisitation]);
                            
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
                    
                    //Save information about this Rule Implementation being used successfully to parse a Game Rule
                    ruleImplementation.setUsed(true);
                }
            });
        });

        if(possibleSyntaxTrees.length > 1) throw ParsingException.moreThanOneMatch(rule, possibleSyntaxTrees);

        return possibleSyntaxTrees.length == 1 ? possibleSyntaxTrees[0] : null;
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