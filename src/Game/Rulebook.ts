import { GameRule } from "./GameRule";

export class Rulebook {
    constructor(public readonly rules: GameRule[]) {}
}