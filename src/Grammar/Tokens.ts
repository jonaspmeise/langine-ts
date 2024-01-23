import { InvalidTokenError } from "../Exceptions/InvalidTokenError";
import { escapeRegex } from "../Util";
import { Reference } from "./Reference";

export class Token {
    public readonly references: Map<string, Reference> = new Map();
    public readonly matchRegex: RegExp;
    public readonly textWithoutTypes: string;

    private readonly containsSimpleTokens: boolean = true;


    //TODO: Do the following:
    //Every Token references contains a
    //  - raw string token (the plain token text that it should match)
    //  - and a typed token
    //TODO: NOW:
    //  - raw string that has raw-text, where all types are replaced through generated uuids
    //  - similarily, the token object holds information about which uuids belongs to which type of object (TODO: WHat class is this?)
    //E.g.:
    //<Component@A> extends <Component@B>
    //-> <uuid1> extends <uuid2>
    //  Token.types = Map()={uuid1: {type: Set(Component), name: A}, uuid2: {type: Set(Component), name: B}}
    //Every one of these values MIGHT (!!!) reference objects (functions?) too, which can be evaluated live against the engine.
    //e.g.: Board: {type: [Component, GameBoardToken], name: Board, values: {neighbor: uuid2(!), fields: () => {...}, rows: () => {...}, columns: () => {...}}}
    //The Functions are evaluated in each game state and presented to the player via websocket

    //Meaning, that when parsing and creating ParsingResults, new Tokens are created and filled, too.
    //in the end, the rule should reference a shallow representation of all tokens that take part in it.
    //TODO FIXME: What to do about Components/classes? Just use the types that we defined as Components?
    //Or is every <<...>> a Component? Only the things we declare as Components are Components, too?
    //Components <=> exists in the game + the lingo of the game? is or can be instantiated by one or multiple entities? (board, hp, values, cards, zones, ...)
    
    constructor(public readonly text: string) {
        const matches = [...text.matchAll(new RegExp(`<<(.+?)>>`, 'g'))];
        let regexQuery: string = escapeRegex(text);
        let replacementText = text;

        //FIXME: Somehow we always expect a capture group here. What if there isn't one?
        const foundReferences = matches.map((groups) => groups[1]);

        if(foundReferences.length > 0) {
            foundReferences.forEach((match) => {
                //We try to identify whether the Reference has a custom Name
                const split = match.split('@');
                if(split.length > 2) throw InvalidTokenError.invalidNamedReference(match);

                const reference = (split.length == 2) ? new Reference(split[0], split[1]) : new Reference(match);
                regexQuery = regexQuery.replaceAll(`<<${match}>>`, `<<(?<${reference.name}>${reference.type})>>`);

                //The text to write into the Token, if we apply it to something.
                replacementText = replacementText.replaceAll(`<<${match}>>`, `<<${reference.type}>>`);

                //Check for duplicates
                if(this.references.has(reference.name)) throw InvalidTokenError.duplicateNamedReferences(text, [reference.name, this.references.get(reference.name)!.name]);
                this.references.set(reference.name, reference);
            });

            //Are there any references to other Types?
            this.containsSimpleTokens = matches[0][0] !== text;
        }
        
        this.matchRegex = new RegExp(regexQuery, 'g');
        this.textWithoutTypes = replacementText;
    }

    public isTypeToken = (): boolean => {
        return this.references.size > 0 && !this.containsSimpleTokens;
    };

    public isMixedToken = (): boolean => {
        return this.references.size > 0 && this.containsSimpleTokens;
    };

    public isSimpleToken = (): boolean => {
        return this.references.size == 0 && this.containsSimpleTokens;
    };
}