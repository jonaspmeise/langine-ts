import { Entity } from "./Entity";
import { Game } from "./Game";
import { InvalidGuardException } from "./InvalidGuardException";
import { ActionID } from "./Types";
import { getFunctionParameters } from "./Util";

export class Guard {
    constructor(game: Game, 
        public action: ActionID, 
        public check: (...args: Entity[]) => boolean,
        public message?: string | ((...args: Entity[]) => string)) {

        //The Action needs to be valid
        if(!game.actionById.has(action)) throw InvalidGuardException.becauseInvalidAction(action);

        //The Check Function needs to consume a subset of Entities from the Action this Guard references
        const checkParameters = getFunctionParameters(check);
        const actionParameters = getFunctionParameters(game.actionById.get(action)!.event);

        checkParameters.forEach((parameter) => {
            if(!actionParameters.includes(parameter)) throw InvalidGuardException.becauseMismatchingCheck(parameter, action, actionParameters);
        });

        //The Message Function (if it is one) needs to consume a subset of Entities that the Check Function receives
        if(message && typeof message == 'function') {
            getFunctionParameters(message).forEach((parameter) => {
                if(!checkParameters.includes(parameter)) throw InvalidGuardException.becauseMismatchingLanguage(parameter, checkParameters);
            });
        }
    }
}