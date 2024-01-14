import { StackEntry } from "../ECS/Types";

export class ParsingException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static invalidInitialRule = (initialRuleName: string, existingRuleNames: string[]): ParsingException => {
        return new ParsingException(`The Initial Rule "${initialRuleName}" does not exist in this Grammar!
        The existing Grammar Rules are:

        ${existingRuleNames.join('\n\t')}
        `);
    };

    public static couldNotParse = (rule: string): ParsingException => {
        return new ParsingException(`The rule "${rule}" could not be parsed by the Grammar!`)
    };

    /*
    TODO:
    public static moreThanOneMatch = (rule: string, possibleGSTs: GrammarSyntaxTree[]): ParsingException => {
        return new ParsingException(`The rule "${rule}" has multiple possible Parsings. Consider changing the rules to make it unique:
        
        ${possibleGSTs.map((gst) => gst.toString()).join('\n\t')}
        `)
    };
    */

    public static infiniteSelfReference = (currentVisitation: StackEntry, stack: StackEntry[]): ParsingException => {
        return new ParsingException(`Parsing the provided Grammar Rules results in an infinite self-reference. While trying to parse
        
        Grammar Rule "${currentVisitation.rule}": "${currentVisitation.text}".

        That exact node has already been parsed before:
            ${stack.map((entry) => `${entry.rule} ("${entry.text}")`).join(` ->\n\t`)}
        `);
    }
}