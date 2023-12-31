describe('Parsing GameRules.', () => {
/*
    Game Rules are the rules given in the Rulebook.
    These Rules have to be parsed into an AST, which is afterwards used to translate each rule into according Code.
    The AST is partly based on default implementations of Game Rules (game-agnostic, general English tokens and syntax),
        and game-specific knowledge (certain keywords, etc.).
    Each Grammar Rule is provided in a *.yaml-Format.
     Each Grammar Rule has an identifier and 1+ multiple implementations, given in an array.

    E.g.

    Draw:
        - <<Player>> draw <<Card>>
        - <<Player>> draws <<Card>>
        - <<Player>> draws <<Card>> from <<Zone>>
    Card:
        - <<Identifier>> Card
        - Card
    Identifier:
        - <<SingleIdentifier>>
        - <<MultipleIdentifier>>
    SingleIdentifier:
        - a
        - an
        - the
    You:
        - you

    This is purely syntactical and not semantic. All semantic knowledge is included in another file.
    Essentially, a big JSON is produced for each parsed Game Rule.
    Parsing is done recursively, and each possible translation is matched.
    Its essentially Tree-DFS.

    E.g. "You draw a Card." would be translated into to:
    {
        Draw: {
            Player: You,
            Card: {
                Identifier: SingleIdentifier
            }
        }
    }

    These Grammar Rules can be extended by the Player by e.g. adding additional grammar documents to the yaml.
    The yaml is shipped with the code to live-transform all rules.
    TODO: Return on the first rule found, or continue to query *all* rules?

    Tests:
    - The file has to be explicitly referenced or assumed to be called "grammar.yaml".
    - There is only allowed to be one level: Name + Implementations.
    - All Names should be uppercase. If not, issue a warning (not confirming to default).
    - There should be no duplicate possible rules for a given rule.
    - Issue warnings when a rule references itself.
    - If the name of a rule is referenced in a rule, throw an error if that rule does not exist.
    - potentially: allow an "entrypoint" rule to start the parsing from. Otherwise: Query all rules (takes longer).
    - If no rule is applicable, throw an Error.
    - If more than one rule is applicable, issue a warning (potential unexpected behavior).
    - If there is a circular reference, issue a warning (or even better: Throw an exception, because the graph is not guaranteed to finish).
*/
});