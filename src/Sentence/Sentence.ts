export abstract class Sentence {
    constructor(public readonly definition: string) {};

    //TODO: Test: Unit-Tests for this
    public static hasReferences = (text: string): boolean => {
        return !!text;
    };

    //TODO: Test: Unit-Tests for this
    public static hasNormalTokens = (text: string): boolean => {
        return !!text;
    };
}