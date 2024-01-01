export class InvalidGrammarException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static ruleHasNoChildArray = (rule: unknown): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule "${rule}" does not have an array as its value.
            All Rules must be of the format {name: string -> implementations: string[]}.`);
    };

    public static implementationIsNotString = (invalidImplementation: unknown[]): InvalidGrammarException => {
        return new InvalidGrammarException(`The given Implementation "${invalidImplementation}" is invalid:
            All Implementations may only consists out of a string, but these contain: 
            ${invalidImplementation.map((implementation) => `${implementation} -> ${typeof implementation}`)}.`);
    };

    public static ruleDoesNotExist = (name: string, existingRulesNames: string[]): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule "${name}" does not exist!
            These rules are registered:
            ${existingRulesNames.join('\n\t')}`);
    };

    //duplicateRules is string[] because the duplicate check happens prior to creation of the Grammar Rule Implementations.
    public static duplicateRule = (name: string, duplicateRules: string[]): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule "${name}" has these following duplicate Rules:
        
        ${duplicateRules.join('\n')}
        
        Each Grammar Rule Implementation should be unique within its own Rule.`)
    };

    public static invalidNamedReference = (namedReference: string): InvalidGrammarException => {
        return new InvalidGrammarException(`The named Reference "${namedReference}" has an invalid Syntax:
        
        The name should have a format of [NAME]@[RULENAME], e.g. Receiver@Component.`);
    };

    public static infiniteFeedback = (name: string, ruleImplementation: string): InvalidGrammarException => {
        return new InvalidGrammarException(`The Grammar Rule "${name}" contains an Implementation that potentially creates an infinite feedback loop:
        
        ${ruleImplementation}
        
        Consider to change the Rule Implementation to consume other Tokens, so that the Rule is being "reduced" with each feedback call.`);
    };
}