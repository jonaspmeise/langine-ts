export class InvalidRegexException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static hasNoMatches = (queryString: string, regex: RegExp): InvalidRegexException => {
        return new InvalidRegexException(`The RegEx "${regex.source}" has no matches when trying to match against:
        
        ${queryString}
        
        Please consider supplying another RegEx.`);
    };
}