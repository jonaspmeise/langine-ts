export class InvalidEntityException extends Error {
    constructor(message: string) {
        super(message);
    }
}