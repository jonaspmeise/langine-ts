import { InvalidGrammarException } from "./Exceptions/InvalidGrammarException";
import { GrammarRuleImplementation } from "./GrammarRuleImplementation";
import { GrammarRuleName } from "./GrammarRuleName";
import { GrammarSyntaxTree } from "./GrammarSyntaxTree";
import { GameRule } from "./Rulebook/GameRule";

export class GrammarRuleParser {
    private NATIVE_RULE_CONST: string = 'NATIVE';
    private rules: Map<string, GrammarRuleImplementation[]> = new Map();

    constructor(
        map: Map<string, string[]>,
        warningConsumer: (warning: string) => void) {
        [...map.entries()].forEach(([name, implementations]) => {
            this.rules.set(
                new GrammarRuleName(name, warningConsumer).name, //FIXME: A little hacky, but the Map specification makes having non-primitives as keys tricky... 
                implementations.map((implementation) => new GrammarRuleImplementation(implementation, name)));
        });

        this.staticallyCheckMap();
    }

    /*
        Checks, whether defined reference rules are 
    */
    private staticallyCheckMap = (): void => {
        this.rules.forEach((ruleImplementations) => {
            ruleImplementations.forEach((ruleImplementation) => {
                ruleImplementation.keyReferences.forEach((keyReference) => {
                    //TODO: Native rules? how to implement them? How to map general stuff as Component, Player, etc.. into these rules?
                    if(keyReference == this.NATIVE_RULE_CONST) return;

                    if(!this.rules.has(keyReference)) throw InvalidGrammarException.nonExistingIdentifier(keyReference, this.rules.keys());
                });
            });
        });
    };

    public getRule = (name: string | GrammarRuleName): GrammarRuleImplementation[] => {
        if(name instanceof GrammarRuleName) name = name.name;

        if(!this.rules.has(name)) throw InvalidGrammarException.ruleDoesNotExist(name, [...this.rules.keys()]);

        return this.rules.get(name)!;
    };

    public getRules = (): ReadonlyMap<string, GrammarRuleImplementation[]> => {
        return this.rules as ReadonlyMap<string, GrammarRuleImplementation[]>;
    };

    public parseRules = (rules: GameRule[]): GrammarSyntaxTree[] => {
        return rules.map((rule) => this.parseRule(rule));
    };

    public parseRule = (rule: GameRule): GrammarSyntaxTree => {
        return new GrammarSyntaxTree();
    };
}