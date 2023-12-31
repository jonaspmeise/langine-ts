export class NonExistingException extends Error {
    constructor(name: string, message: ((name: string) => string) = (name) => `"${name}" does not exist!`) {
        super(message(name ?? ''));
    }
}