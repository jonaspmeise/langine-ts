export class SentenceError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static wrongFormat = (definition: string): SentenceError => {
        return new SentenceError(`
        The sentence "${definition}" could not be parsed into any possible Sentence Type!
        Consider using one of these Types:

        Simple Sentence:    "Some simple text, without any tokens!", "Easy, right?"
        Type Sentence:      "<<MyCustomTokenType>>", "<<Component>>"
        Mixed Sentence:     "An <<Apple>> is a Fruit.", "<<Component@Something>> consists out of <<Component@SomethingElse>>.`);
    };

    public static simpleSentenceWithReferences = (definition: string): SentenceError => {
        return new SentenceError(`
        A simple sentence can not have any references in it!
        
        ${definition}`);
    };

    public static mixedWithoutReferences = (definition: string): SentenceError => {
        return new SentenceError(`
        A mixed sentence needs to have a reference in its definition! Your definition does not include any.
        
        ${definition}`);
    };

    public static mixedWithoutNormalText = (definition: string): SentenceError => {
        return new SentenceError(`
        A mixed sentence needs to have some normal Tokens in its definition! Your definition does not include any.
        
        ${definition}`);
    }
}