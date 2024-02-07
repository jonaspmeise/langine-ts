export class InvalidRulebookError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static noRulesFound = (text?: string): InvalidRulebookError => {
        return new InvalidRulebookError(`
        No Game Rules could be found!

        ${text === undefined ? '' : `"${text}"`}
        
        Make sure to mark all Game Rules accordingly:
        {{ [RULE] }}
        `);
    };
}