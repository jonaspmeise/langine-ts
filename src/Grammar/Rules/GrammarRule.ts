import { GrammarRuleError } from "../../Error/GrammarRuleError";
import { Sentence } from "../../Sentence/Sentence";
import { ApplicableTokens } from "./ApplicableTokens";

export abstract class GrammarRule<I extends Sentence, O extends Sentence> {
    constructor(
        public readonly input: I,
        public readonly output: O
    ) {}

    //Is the Input of this Rule applicable to the given sentence?
    public getApplicableTokens = (target: Sentence): ApplicableTokens | null => {
        const query = this.input.getQuery();
        const matches = Array.from(target.getDefinition().matchAll(query));

        //we need to check, whether the found syntactical token match is a semantic one, too.
        if(matches === null) return null;

        const match = matches.find((match) => {
            //If we have no groups, then we matched just normal Tokens. 
            //The fact that we have a non-null match here means that this is already "correct"
            if(match.groups === undefined) return true;

            //check, whether the types of this ALL (FIXME: ?) appear in the target, too.
            return Object.entries(match.groups).every(([referenceThis, referenceTarget]) => {
                const typesTarget = target.references.get(referenceTarget)!.types;

                //TODO: FIXME: Use better set comparison operators here!
                return Array.from(this.input.references.get(referenceThis)!.types).every((type) => Array.from(typesTarget).includes(type));
            });
        });

        if(match === undefined) return null;

        return new ApplicableTokens(this, match[1], new Map(Object.entries(match.groups ?? [])));
    };

    //FIXME: Better types here possible?
    //TODO: Validation???
    public applyTo(sentence: I): I {
        const applicableTokens = this.getApplicableTokens(sentence);

        if(applicableTokens === null) throw GrammarRuleError.cantBeApplied(this, sentence);
        
        //TODO: FIXME: Hacky, but Type Rules need to have the References defined in their Output copied into the new Sentence
        Array.from(this.output.references.values()).forEach((reference) => {
            sentence.references.set(reference.id, reference);
        });

        //No References to update means that we're done
        if(applicableTokens.referenceMatches.size === 0) {
            //simple case: Update Definition with our Output
            sentence.setDefinition(sentence.getDefinition().replace(applicableTokens.matchedText, this.output.getDefinition()));
            
            return sentence;
        }

        Array.from(applicableTokens.referenceMatches.entries()).forEach(([ruleReferenceId, sentenceReferenceId]) => {
            const sentenceReference = sentence.references.get(sentenceReferenceId);
            const ruleReference = this.output.references.get(ruleReferenceId); //FIXME: Is .output correct here? Too tired to think atm.

            //TODO: Write test case for this / think about what to do here.
            //TODO: There is a big confusion right now on what Token to write where.
            //Probably: Redo all the test-cases, simplify each method and really think about before you code...
            if(sentenceReference === undefined || ruleReference === undefined) throw Error();

            sentence.references.delete(sentenceReferenceId);

            //TODO: HACK HACJAKCJKALJKAHCJKA
            Array.from(sentenceReference.types).forEach((type) => {
                ruleReference.types.add(type);
            });
            sentence.references.set(ruleReferenceId, ruleReference);
            sentence.setDefinition(sentence.getDefinition().replace(sentenceReferenceId, ruleReferenceId));
            //TODO: Call Function?????
        });

        return sentence;
    }

    public pretty = (): string => {
        return `${this.input.getDefinition()} -> ${this.output.getDefinition()}`;
    };
}