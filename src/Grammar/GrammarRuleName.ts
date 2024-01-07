import { DefaultLogger } from "../Logger/DefaultLogger";
import { InvalidGrammarException } from "../Exceptions/InvalidGrammarException";
import { Logger } from "../Logger/Logger";

export class GrammarRuleName {
    constructor(public readonly name: string, private readonly logger: Logger = new DefaultLogger()) {
        this.check();
    }

    private check = (): void => {
        /*  Some Tokens are not allowed within Names, because they lead to an invalid RegEx-Syntax in the search query
            For example

                ^(?<My-Rule-Name>.+)$

            is not a valid RegEx
        */
        if(!new RegExp('^[A-Za-z0-9_]+$').test(this.name)) throw InvalidGrammarException.invalidRuleName(this.name);

        //For easier "spotting" of References in Grammar Definitions, they should start with a capital letter
        if(this.name.charAt(0) != this.name.charAt(0).toUpperCase()) this.logger.warn(`The Rule "${this.name}" does not start with an Uppercase! Consider starting all Rule Names with uppercase letters.`);
    };
}