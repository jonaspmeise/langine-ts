export class GrammarRuleName {
    constructor(public readonly name: string, warningConsumer: (warning: string) => void) {
        //Issue warning if the Name of the rule is not beginning with an Uppercase s
        if(name.charAt(0) != name.charAt(0).toUpperCase()) warningConsumer(`The Rule "${name}" does not start with an Uppercase! Consider starting all Rule Names with uppercase letters.`);
    }
}