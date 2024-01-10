export class InvalidGrammarException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static ruleHasNoChildArray = (rule: unknown): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule "${rule}" does not have an array as its value.
            All Rules must be of the format {name: string -> implementations: string[]}.`);
    };

    public static implementationIsNotStringOrNumber = (invalidImplementation: unknown[]): InvalidGrammarException => {
        return new InvalidGrammarException(`The given Implementation "${invalidImplementation}" is invalid:
            All Implementations may only consists out of a string, but these contain: 

            ${invalidImplementation.map((implementation) => `${implementation} -> ${typeof implementation}`).join('\n\t')}.`);
    };

    public static ruleDoesNotExist = (name: string, existingRulesNames: string[]): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule "${name}" does not exist!
            These rules are registered:
            ${existingRulesNames.join('\n\t')}`);
    };

    //duplicateRules is string[] because the duplicate check happens prior to creation of the Grammar Rule Definitions.
    public static duplicateRule = (name: string, duplicateRules: string[]): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule "${name}" has these following duplicate Rules:
        
        ${duplicateRules.join('\n')}
        
        Each Grammar Rule Definition should be unique within its own Rule.`)
    };

    public static invalidNamedReference = (rule: string, namedReference: string): InvalidGrammarException => {
        return new InvalidGrammarException(`The named Reference "${namedReference}" in the Rule "${rule}" has an invalid Syntax:
        
        The name should have a format of [NAME]@[RULENAME], e.g. Receiver@Component.`);
    };

    public static infiniteFeedback = (name: string, ruleDefinition: string): InvalidGrammarException => {
        return new InvalidGrammarException(`The Grammar Rule "${name}" contains an Implementation that potentially creates an infinite feedback loop:
        
        ${ruleDefinition}
        
        Consider to change the Rule Definition to consume other Tokens, so that the Rule is being "reduced" with each feedback call.`);
    };

    public static duplicateReferenceKey = (referenceKey: string, rule: string): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule "${rule}" contains a duplicate Key reference: ${referenceKey}.
        
        Consider renaming the reference "${referenceKey}", so that each reference has a unique Name in that Rule Definition.
        The syntax for that is:
        
        [CUSTOM_NAME]@[RULE_IDENTIFIER]
        
        e.g.
        
        Receiver@Component`);
    };

    public static nonExistingIdentifier = (referenceKey: string, existingRuleNames: IterableIterator<String>): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule Reference Key "${referenceKey}" does not exist!
        These following Grammar Rules only exist:
        
        ${[...existingRuleNames].join('\n\t')}`);
    };

    public static invalidRuleName = (ruleName: string): InvalidGrammarException => {
        return new InvalidGrammarException(`The Rule "${ruleName}" has an invalid Name:
        
        It may only contain alphabetical, numerical, and "_" characters!
        `)
    };

    public static fileError = (filepath: string): InvalidGrammarException => {
        return new InvalidGrammarException(`An error occured when trying to open the file "${filepath}"!`);
    }
}