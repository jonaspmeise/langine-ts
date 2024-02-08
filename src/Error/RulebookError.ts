export class RulebookError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static noRulesFound = (text?: string): RulebookError => {
        return new RulebookError(`
        No Game Rules could be found!

        ${text === undefined ? '' : `"${text}"`}
        
        Make sure to mark all Game Rules accordingly:
        {{ [RULE] }}
        `);
    };
}