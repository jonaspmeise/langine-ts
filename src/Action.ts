import { Component } from "./Component";
import { Game } from "./Game";
import { InvalidActionException } from "./InvalidActionException";
import { getFunctionParameters } from "./Util";

export class Action {
    constructor(
        game: Game,
        public language: ((arg1: Component[]) => string) | string,
        public event: (arg1: Component[]) => void    
    ) {
        
        const eventArgs = getFunctionParameters(event);

        if(eventArgs.length == 0) throw new InvalidActionException(`An Action Event Function must take atleast one Component as its argument!`);
        eventArgs.forEach((component) => {
            if(!game.componentExists(component)) throw new InvalidActionException(`The Event Function of an Action references a Component "${component}" which does not exist! Did you register it already?`);
        });

        if(typeof language == 'function') {
            //check that the parameters for the lanugage are a subset of the event parameter
            const languageArgs = getFunctionParameters(language);

            if(languageArgs) languageArgs.forEach((component) => {
                if(!eventArgs.includes(component)) throw new InvalidActionException(`You can't reference a Component "${component}" in the Language definition of an Action, if that Component is not being used in the Event function!`);
            });
        }
    }
}