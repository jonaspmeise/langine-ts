export class InvalidGuardException extends Error {
    constructor(message: string) {
        super(message);
    }
}