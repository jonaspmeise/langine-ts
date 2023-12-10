export class InvalidQueryException extends Error {
    constructor(message: string) {
        super(message);
    }
}