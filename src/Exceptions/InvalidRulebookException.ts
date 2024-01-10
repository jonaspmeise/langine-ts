export class InvalidRulebookException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static containsNoRules = (text: string): InvalidRulebookException => {
        return new InvalidRulebookException(`
        No rules could be parsed from the supplied text from which the Rulebook should be constructed:

        ${text}
        
        Did you use a custom extractor function or the right syntax to indicate the Game Mechanics?`);
    };

    public static noRuleCaptureGroup = (regEx: RegExp): InvalidRulebookException => {
        return new InvalidRulebookException(`The RegExp "${regEx}" does not have a named capturing group named "rule!"`);
    };
    
    public static fileError = (filepath: string): InvalidRulebookException => {
        return new InvalidRulebookException(`An error occured when trying to open the file "${filepath}"!`);
    };
}