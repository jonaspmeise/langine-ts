import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";
import { escapeRegex } from "../Util";
import { GrammarOptions, injectWithDefaultValues } from "./GrammarTypes";

export class GrammarRuleDefinition {
    //The Query to execute when trying to check whether a given Game Rule matches this Rule.
    public readonly queryRegex: RegExp;

    //Holds information about whether this Grammar Rule was used when parsing a Game Rule.
    private used: boolean = false;

    //This maps the named keys to their respective types;
    //e.g. the Rule <<Holder@Component>> has <<Attribute@Component>> maps
    //
    //Holder -> Component
    //Attribute -> Component
    //
    //Without using any names, we would have two capture groups which both are named "Component", thus causing an error.
    //If no name is provided, the name of the Rule is taken as an identifier.
    public readonly keyReferences: Map<string, string> = new Map(); 

    constructor(public readonly rule: string, parentRuleName?: string, customOptions?: Partial<GrammarOptions>) {
        const options = injectWithDefaultValues(customOptions);

        //tokens which have special meaning in RegEx (such as '.', '\' etc...)
        //should not be interpreted as RegEx tokens
        let searchRule = escapeRegex(rule);

        (options.referenceExtractor.parse(rule) ?? []).forEach((reference) => {
            const split = reference.split('@');

            let referenceName: string, referenceType: string;

            if(split.length == 2) {
                referenceName = split[0];
                referenceType = split[1];
            } else if(split.length > 2) throw InvalidGrammarException.invalidNamedReference(reference, reference);
            else {
                referenceName = referenceType = reference;
            }
            
            //Somebody fooled around and did not provide a Name for the named Reference at all!
            if(!referenceName) throw InvalidGrammarException.invalidNamedReference(rule, reference);

            //Check whether there is a duplicate Identifier within all key references of this Rule Definition
            if(this.keyReferences.has(referenceName)) throw InvalidGrammarException.duplicateReferenceKey(referenceName, rule);

            //Check for potential infinite self-references, when a Grammar Rule Definition references itself WITHOUT consuming any other Tokens.
            //Only do this if the parentRuleName is supplied
            if(parentRuleName != undefined && referenceType == parentRuleName && new RegExp(`^${options.referenceExtractor.reconstruct(reference)}$`).test(this.rule)) throw InvalidGrammarException.infiniteFeedback(parentRuleName, reference);

            this.keyReferences.set(referenceName, referenceType);

            searchRule = searchRule.replace(options.referenceExtractor.reconstruct(reference), `(?<${referenceName}>.+)`);
        });

        this.queryRegex = new RegExp(`^${searchRule}$`);
    }

    setUsed(used: boolean): void {
        this.used = used;
    };

     wasUsed(): boolean {
        return this.used;
    }
}