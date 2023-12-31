import { ActionID } from "../ECS/Types";

export class InvalidActionException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static becauseDoesNotExist = (action: ActionID) => {
        return new InvalidActionException(`The Action "${action}" does not exist! Did you already register it?`);
    };
}