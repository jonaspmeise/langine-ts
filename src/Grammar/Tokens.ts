import { InvalidTokenError } from "../Exceptions/InvalidTokenError";
import { escapeRegex } from "../Util";
import { Reference } from "./Reference";

export class Token {
    public readonly references: Map<string, Reference> = new Map();
    public readonly regex: RegExp;
    private readonly containsSimpleTokens: boolean = true;

    constructor(public readonly text: string) {
        const matches = [...text.matchAll(new RegExp(`<<(.+?)>>`, 'g'))];
        let regexQuery: string = escapeRegex(text);
        //FIXME: Somehow we always expect a capture group here. What if there isn't one?
        const foundReferences = matches.map((groups) => groups[1]);

        if(foundReferences.length > 0) {
            foundReferences.forEach((match) => {
                //We try to identify whether the Reference has a custom Name
                let reference: Reference;
                
                const split = match.split('@');
                if(split.length > 2) throw InvalidTokenError.invalidNamedReference(match);

                if(split.length == 2) {
                    reference = new Reference(split[1], split[0]);
                    regexQuery = regexQuery.replaceAll(`<<${match}>>`, `<<(?<${split[0]}>${split[1]})>>`);
                } else {
                    reference = new Reference(match);
                    regexQuery = regexQuery.replaceAll(`<<${match}>>`, `<<(${match})>>`);
                }

                //Check for duplicates
                if(this.references.has(reference.name)) throw InvalidTokenError.duplicateNamedReferences(text, [reference.name, this.references.get(reference.name)!.name])
                this.references.set(reference.name, reference);
            });

            //Are there any references to other Types?
            this.containsSimpleTokens = matches[0][0] !== text;
        }
        
        this.regex = new RegExp(regexQuery, 'g');
    }

    public isTypeToken = (): boolean => {
        return this.references.size > 0 && !this.containsSimpleTokens;
    };

    public isMixedToken = (): boolean => {
        return this.references.size > 0 && this.containsSimpleTokens;
    };

    public isSimpleToken = (): boolean => {
        return this.references.size == 0 && this.containsSimpleTokens;
    };
}