import { InvalidTokenError } from "../Exceptions/InvalidTokenError";
import { Reference } from "./Reference";

export class Token {
    public readonly references: Map<string, Reference> = new Map();
    private readonly containsSimpleTokens: boolean = true;

    constructor(public readonly text: string) {
        const matches = [...text.matchAll(new RegExp(`<<(.+?)>>`, 'g'))];
        //FIXME: Somehow we always expect a capture group here. What if there isn't one?
        const foundReferences = matches.map((groups) => groups[1]);

        if(foundReferences.length > 0) {
            foundReferences.forEach((match) => {
                //We try to identify whether the Reference has a custom Name
                let reference: Reference;
                
                const split = match.split('@');
                if(split.length > 2) throw InvalidTokenError.invalidNamedReference(match);

                if(split.length == 2) {
                    reference = new Reference(split[0], split[1]);
                } else {
                    reference = new Reference(match);
                }

                //Check for duplicates
                if(this.references.has(reference.name)) throw InvalidTokenError.duplicateNamedReferences(match, [reference.name, this.references.get(reference.name)!.name])
                this.references.set(reference.name, reference);
            });

            this.containsSimpleTokens = matches[0][0] !== text;
        }
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