import { ActionID } from "../ECS/Types";

export class InvalidGuardException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static becauseInvalidAction = (action: ActionID) => {
        return new InvalidGuardException(`A Guard could not be registered, because its Action "${action}" does not exist! Did you already register it?`);
    };

    public static becauseMismatchingLanguage = (messageParameter: string, checkParameters: string[]) => {
        return new InvalidGuardException(`A Guard could not be registered, because the Parameter "${messageParameter}" of the Message Function is not used as a parameter in the Check Function: "${checkParameters}". How is "${messageParameter}" supposed to be chosen?`);
    };

    public static becauseMismatchingCheck = (checkParameters: string, action: ActionID, actionParameters: string[]) => {
        return new InvalidGuardException(`A Guard could not be registered, because the Parameter "${checkParameters}" of the Check Function is not consumed by the Event of Action "${action}". "${action}" consumes: \n"${actionParameters}.\nOnly the same Parameters as the Event are allowed in the Check."`);
    };
}