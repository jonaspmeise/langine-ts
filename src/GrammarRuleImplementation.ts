import { InvalidGrammarException } from "./Exceptions/InvalidGrammarException";
import { escapeRegex } from "./Util";

export class GrammarRuleImplementation {
    public readonly queryRegex: RegExp;

    //This maps the named keys to their respective types;
    //e.g. the Rule <<Holder@Component>> has <<Attribute@Component>> maps
    //
    //Holder -> Component
    //Attribute -> Component
    //
    //Without using any names, we would have two capture groups which both are named "Component", thus causing an error.
    //If no name is provided, the name of the Rule is taken as an identifier.
    public readonly keyReferences: Map<string, string> = new Map(); 

    constructor(public readonly rule: string, parentRuleName: string) {
        const searchRegex = new RegExp('(?<=<<)[^>]+(?=>>)', 'g');

        const results = rule.match(searchRegex) ?? [];

        //tokens which have special meaning in RegEx (such as '.', '\' etc...)
        //should not be interpreted as RegEx tokens
        let searchRule = escapeRegex(rule);
        results.forEach((result) => {
            //If we use named keys, export them singularly
            const namedKey = result.split('@');

            //These two are usually identical, unless named References are used
            let captureGroupName = result;
            let correspondingRuleName = result;

            if(namedKey.length == 2) {
                captureGroupName = namedKey[0]; //The prior part of a Reference like "abc@Component" becomes the capture group name
                correspondingRuleName = namedKey[1];
            } else if(namedKey.length > 2) throw InvalidGrammarException.invalidNamedReference(result);
            
            //Check whether there is a duplicate Identifier within all key references of this Rule Implementation
            if(this.keyReferences.has(result)) throw InvalidGrammarException.duplicateReferenceKey(result, rule);

            //Check for potential infinite self-references, when a Grammar Rule Implementation references itself WITHOUT consuming any other Tokens.
            if(correspondingRuleName == parentRuleName && new RegExp(`^<<${captureGroupName}>>$`).test(this.rule)) throw InvalidGrammarException.infiniteFeedback(parentRuleName, result);

            //Somebody fooled around and did not provide a Name for the named Reference at all!
            if(captureGroupName.length == 0) throw InvalidGrammarException.invalidNamedReference(result);

            this.keyReferences.set(result, correspondingRuleName);

            searchRule = searchRule.replace(`<<${result}>>`, `(?<${captureGroupName}>.+)`);
        });

        this.queryRegex = new RegExp(`^${searchRule}$`);
    }
}