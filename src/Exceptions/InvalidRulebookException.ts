export class InvalidRulebookException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static containsNoRules = (filepath: string, regex?: RegExp): InvalidRulebookException => {
        const message = 
            `The Rulebook provided at "${filepath}" contains no valid rules!
            ${regex !== undefined ? `Does the RegEx "${regex}" capture anything for the named Group "rule" in that Rulebook?`: ''}`;

        return new InvalidRulebookException(message);
    };

    public static noRuleCaptureGroup = (regEx: RegExp): InvalidRulebookException => {
        return new InvalidRulebookException(`The RegExp "${regEx}" does not have a named capturing group named "rule!"`);
    };
}