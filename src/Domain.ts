export class Langine {

}

export class Rulebook {
    constructor(public readonly rules: GameRule[]) {}
}

export class Grammar {
    constructor(public readonly rules: GrammarRule<?, ?>[]) {}
}

export class GameRule {
    constructor(public readonly definition: SimpleSentence) {}
}

export abstract class GrammarRule<I extends Sentence, O extends Sentence> {
    constructor(
        public readonly input: I,
        public readonly output: O
    ) {}

    public static build = (input: Sentence, output: Sentence) => {
        //Discard non-plausible combinations.

        //Type as Input only works if the Output is a Type, too.
        if(input instanceof TypeSentence && !(output instanceof TypeSentence)) throw new Error();
        
        //If the Input is mixed, the Output would lose Token information if it had only normal Tokens.
        if(input instanceof MixedSentence && output instanceof SimpleSentence) throw new Error();

        //If the Output is a Type, all the Input is consumed into the new Token and the Consumer Function called.
        if(output instanceof TypeSentence) return new TypeGrammarRule(input, output);
        
        //Otherwise: Shuffle around Tokens
        return new ReplacementGrammarRule(input, output);
    }
}

/*  Different Rule Types based on Input and Output:
    1. Simple Sentence -> Simple Sentence ==> Shuffle Grammar Rule. Replace Tokens.
    2. Simple Sentence -> Type Sentence ==> Type Grammar Rule (create new Token with that Type, replace the previous Tokens with it). Call Function w/o Inputs?
        3. Simple Sentence -> Mixed Sentence ==> Does not exist! (This should be done in two iterations, if anything. First 2, then 1)
        4. Type Sentence -> Simple Sentence ==> Can be done, but a little nonsensical. Replace the Token with the given Text.
    5. Type Sentence -> Type Sentence ==> Type Grammar Rule. Add the Output Type to the Input. Call Function with the Type.
        6. Type Sentence -> Mixed Sentence ==> Does not exist! (Lose information from the Reference + incoherence of matching other simple Tokens)
        7. Mixed Sentence -> Simple Sentence ==> Does not exist! (Lose information from the Reference)
    8. Mixed Sentence -> Type Sentence ==> Create Rule with Tokens. Call Function with the Type.
    9. Mixed Sentence -> Mixed Sentence ==> Shuffle around the Tokens. Assure that the same References are used in Output and Output.
*/

//Shifting Grammar Rules can only map Input to Outputs of same Type, because they basically shuffle Tokens
//Does not work for Type Tokens!
export class ReplacementGrammarRule<S extends Sentence = SimpleSentence | MixedSentence> extends GrammarRule<S, S> {
    constructor(input: S, output: S) {
        super(input, output);
        //TODO: Test: See that if there are Tokens in the Input/Output, that the Output Tokens are a subset of the Input Tokens.
    }
}

export class TypeGrammarRule<S extends Sentence> extends GrammarRule<S, TypeSentence> {

}

export abstract class Sentence {
    constructor(public readonly definition: string) {};

    static parse = (text: string): Sentence => {
        //TODO: If the Text only has norrmal Tokens, make it a SimpleSentence

        if(!this.hasReferences(text)) return new SimpleSentence(text);

        const references = Reference.parseReferences(text);

        //Not a Simple Sentence, but has no References either? Impossible Case!
        if(references.size === 0) throw Error();

        if(!this.hasNormalTokens(text)) return new TypeSentence(Array.from(references.values())[0]);

        return new MixedSentence(text, references);
    }

    //TODO: Test: Unit-Tests for this
    protected static hasReferences = (text: string): boolean => {
        return false;
    };

    //TODO: Test: Unit-Tests for this
    protected static hasNormalTokens = (text: string): boolean => {
        return false;
    };
}

export class SimpleSentence extends Sentence {
    constructor(definition: string) {
        super(definition);
        //TODO: Test: Check that there are no References.
    }
}

export class TypeSentence extends Sentence {
    constructor(public readonly reference: Reference) {
        super(reference.toDefinition());
    }
}

export class MixedSentence extends Sentence {
    constructor(definition: string, public readonly references: References) {
        super(definition);
        //TODO: Test: Check whether the References provided actually show up in the Definition.
    }
}

export class Reference {
    constructor(
        public readonly name: string,
        public readonly type: [string],
        public readonly id: ReferenceId = 
    ) {}

    public toDefinition = (): string => {
        return '';
    };

    public static parseReferences = (text: string): References => {
        return new Map();
    };
}

export type ReferenceId = string;

export type References = Map<ReferenceId, Reference>;