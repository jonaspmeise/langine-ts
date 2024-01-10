import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";
import { escapeRegex, generateCombinations, interweave } from "../Util";
import { GrammarOptions, injectWithDefaultValues } from "./GrammarTypes";

export class GrammarRuleDefinition {
    //The Query to execute when trying to check whether a given Game Rule matches this Rule.
    public readonly regexQueries: RegExp[] = [];

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

    constructor(public readonly rule: string, parentRuleName?: string, customOptions?: Partial<GrammarOptions>, caseSensitive: boolean = false) {
        const options = injectWithDefaultValues(customOptions);
        const regexFlags = caseSensitive ? '' : 'i';

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

        const baseRegex = new RegExp(`^${searchRule}$`, regexFlags);

        //Construct possible Variations of the RegExp, because sometimes
        //A single Token with a whitespace should match a single rule.
        //E.g., "The green Game Board" should match the Rule <<Identifier>> <<Component>>
        //In natural Language, it's obvious that:
        //  Identifier -> "The green"
        //  Component -> "Game Board"
        //But normally, the normal regex would only consider matching this:
        //  Identifier -> "The green Game"
        //  Component -> "Board"
        //To prevent this, we vary the greedy/lazy quantifier of each Reference's selector and create variations from our Regex
        if(this.keyReferences.size >= 2) {
            this.regexQueries.push(...GrammarRuleDefinition.createRegexVariations(baseRegex));
        } else {
            this.regexQueries.push(baseRegex);
        }
    };

    public static createRegexVariations = (regex: RegExp): RegExp[] => {
        const parts = regex.source.split(new RegExp(`\\.\\+`));

        //FIXME: We currently support up to 3 tokens, divided by space, per Reference in a pure-Reference rule.
        //E.g., the Rule "Green and red Game Board" is tried with all possible variations against:
        //  Sentence -> <<Identifier>> <<Component>>
        //since there are a total of 5 Tokens, and up to 3-token-combinations are evaluated as groups.
        //The correct groups in the above example being Identifier -> "Green and red", Component -> "Game Board"
        const quantificationTokenCombinations = generateCombinations(['.+', '.+\\s.+', '.+\\s.+\\s.+'], parts.length - 1);

        //add all interweaved combinations to 
        return quantificationTokenCombinations.map((combination) => new RegExp(interweave(parts, combination), regex.flags));
    }

    setUsed(used: boolean): void {
        this.used = used;
    };

     wasUsed(): boolean {
        return this.used;
    }
}