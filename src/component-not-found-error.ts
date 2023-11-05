export class ComponentNotFoundError extends Error {
    constructor(private componentName: string) {
        super(`The Component "${componentName}" is undefined. Please register it first!`);
    }
}