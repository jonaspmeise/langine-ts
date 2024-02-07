import { Sentence } from "../../Sentence/Sentence";

export abstract class GrammarRule<I extends Sentence, O extends Sentence> {
    constructor(
        public readonly input: I,
        public readonly output: O
    ) {}

    //Does the given Sentence match the "pattern" described in the Input of the Grammar Rule?
    public canBeAppliedTo = (target: Sentence): boolean => {
        const query = this.input.getQuery();
        const matches = Array.from(target.definition.matchAll(query));

        //we need to check, whether the found syntactical token match is a semantic one, too.
        if(matches !== null) {
            const match = matches.find((match) => {
                //If we have no groups, then we matched just normal Tokens. 
                //The fact that we have a non-null match here means that this is already "correct"
                if(match.groups === undefined) return true;

                //check, whether the types of this ALL (FIXME: ?) appear in the target, too.
                return Object.entries(match.groups).every(([referenceThis, referenceTarget]) => {
                    const typesTarget = target.references.get(referenceTarget)!.types;

                    return this.input.references.get(referenceThis)!.types.every((type) => typesTarget.includes(type));
                });
            });

            if(match === undefined) return false;

            return true
        } else {
            return false;
        }
    };

    public pretty = (): string => {
        return `${this.input.definition} -> ${this.output.definition}`;
    };
}