import { GrammarSyntaxTree } from "../ECS/Types";
import { GameRule } from "../Rulebook/GameRule";

export class GrammarTest {
    constructor(public readonly givenInput: GameRule, public readonly expectedOutput: GrammarSyntaxTree) {}
}