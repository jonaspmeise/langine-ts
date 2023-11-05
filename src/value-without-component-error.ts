export class ValueWithoutComponentError extends Error {
    constructor(valueName: string) {
        super(`The value "${valueName} can not be matched to any Component definition!`);
    }
}