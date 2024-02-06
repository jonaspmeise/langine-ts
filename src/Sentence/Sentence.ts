export abstract class Sentence {
    constructor(public readonly definition: string) {};

    public static hasReferences = (text: string): boolean => {
        return new RegExp('(?<=<<).+?(?=>>)', 'g').test(text);
    };

    public static hasNormalTokens = (text: string): boolean => {
        return !(new RegExp('^(?:<<[^<>]+?>>)+$', 'gm').test(text));
    };
}