import { InvalidSentenceError } from "../Exceptions/InvalidSentenceError";
import { escapeRegex, intersection } from "../Util";
import { Token, TokenId } from "./Token";

export class Sentence {
    public readonly matchRegex: RegExp;
    public readonly definition: string;
    private readonly containsSimpleTokens: boolean = true;


    //TODO: Do the following:
    //Every Sentence references contains a
    //  - raw string Sentence (the plain Sentence text that it should match)
    //  - and a typed Sentence
    //TODO: NOW:
    //  - raw string that has raw-text, where all types are replaced through generated uuids
    //  - similarily, the Sentence object holds information about which uuids belongs to which type of object (TODO: WHat class is this?)
    //E.g.:
    //<Component@A> extends <Component@B>
    //-> <uuid1> extends <uuid2>
    //  Sentence.types = Map()={uuid1: {type: Set(Component), name: A}, uuid2: {type: Set(Component), name: B}}
    //Every one of these values MIGHT (!!!) reference objects (functions?) too, which can be evaluated live against the engine.
    //e.g.: Board: {type: [Component, GameBoardSentence], name: Board, values: {neighbor: uuid2(!), fields: () => {...}, rows: () => {...}, columns: () => {...}}}
    //The Functions are evaluated in each game state and presented to the player via websocket

    //Meaning, that when parsing and creating ParsingResults, new Sentences are created and filled, too.
    //in the end, the rule should reference a shallow representation of all Sentences that take part in it.
    //TODO FIXME: What to do about Components/classes? Just use the types that we defined as Components?
    //Or is every <<...>> a Component? Only the things we declare as Components are Components, too?
    //Components <=> exists in the game + the lingo of the game? is or can be instantiated by one or multiple entities? (board, hp, values, cards, zones, ...)
    
    constructor(text: string, public readonly tokens: Map<TokenId, Token> = new Map()) {        
        const tokenDefinitions = [...text.matchAll(new RegExp(`<<(.+?)>>`, 'g'))];
        let regexQuery: string = escapeRegex(text);
        let replacementText = text;

        //FIXME: Somehow we always expect a capture group here. What if there isn't one?
        const foundReferences = tokenDefinitions.map((groups) => groups[1]);

        //There should be no Reference which is passed, but does not exist anymore. 
        //We want a clean Sentence definition without dead references
        const inactiveReferences = Array.from(tokens.entries())
            .map(([id, _]) => id)
            .filter((id) => !(new RegExp(`<<${id}>>`).test(text)))

        if(inactiveReferences.length > 0) throw InvalidSentenceError.inactiveReference(text, inactiveReferences);

        if(foundReferences.length > 0) {
            foundReferences.forEach((match) => {
                //If the token is already registered, we don't need to continue
                if(this.tokens.has(match)) {
                    //We still have to adjust the regex
                    regexQuery = regexQuery.replace(`<<${match}>>`, `<<(?<${match}>.+?)>>`);
                    return;
                }

                //We try to identify whether the Reference has a custom Name
                const split = match.split('@');
                if(split.length > 2) throw InvalidSentenceError.invalidNamedReference(match);

                const reference = (split.length == 2) ? new Token([split[0]], split[1]) : new Token([match], match);
                //Replace the Token Definition with its Reference
                //We use a weird Capturing Group here to capture possible multi-token references (cross-border words)
                regexQuery = regexQuery.replace(`<<${match}>>`, `<<(?<${reference.id}>.+?)>>`);

                //The text to write into the Sentence, if we apply it to something.
                replacementText = replacementText.replace(`<<${match}>>`, `<<${reference.id}>>`);

                //Check for duplicate Types that have the same name. This would cause confusion when mapping the parsed Types to Functions.
                const duplicateToken = [...this.tokens.values()].find((token) => token.name === reference.name);
                if(duplicateToken !== undefined) throw InvalidSentenceError.duplicateNamedReferences(text, [reference, duplicateToken]);

                this.tokens.set(reference.id, reference);
            });
    
            //Check, whether our sentence has normal tokens, too.
            this.containsSimpleTokens = tokenDefinitions[0][0] !== text;
            
            this.matchRegex = new RegExp(`(?=${regexQuery})`, 'g');
        } else {
            this.matchRegex = new RegExp(text, 'g');
        }

        this.definition = replacementText;
    }

    public isTypeSentence = (): boolean => {
        return this.tokens.size > 0 && !this.containsSimpleTokens;
    };

    public isMixedSentence = (): boolean => {
        return this.tokens.size > 0 && this.containsSimpleTokens;
    };

    public isSimpleSentence = (): boolean => {
        return this.tokens.size == 0 && this.containsSimpleTokens;
    };

    public appearsIn = (sentence: Sentence): boolean => {
        const possibleMatches = Array.from(sentence.definition.matchAll(this.matchRegex)).map((match) => match.groups);

        const match = possibleMatches.find((match) => {
            if(match === undefined) return;

            //Find all Token Pairs that match on the syntactical Regex
            const tokenPairs = Object.entries(match).map(([ourTokenId, otherTokenId], _) => {
                if(!this.tokens.has(ourTokenId)) throw new Error(); //TODO: Throw error!!
                if(!sentence.tokens.has(otherTokenId)) throw new Error(); //TODO: Throw error!

                return [this.tokens.get(ourTokenId)!, sentence.tokens.get(otherTokenId)!];
            });

            //Check, whether each Pair has atleast one matching Type in common.
            return tokenPairs.every((pair) => {
                const [ourToken, theirToken]: Token[] = pair;
                const matchingTypes = intersection(ourToken.types, theirToken.types);

                return matchingTypes.size > 0;
            });
        });

        //If we find a match, we check whether the Token with this ID matches any of our Tokens.
        return match !== undefined;
    }
}