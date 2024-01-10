import { Entity } from "./Entity";

export type PlainObject = {[key: string]: unknown};
export type ComponentID = string;
export type EntityID = string;
export type StateID = string;
export type ActionID = string;
export type PlayerID = string;
export type GuardID = string;
export type ActionFunction = {(...args: (Entity | EntityID)[]): void} & {actionId: ActionID};
export type GameDescription = {[key: string]: string[]};
export type Rule = string;

export type Token = string;

export type GrammarSyntaxTree = {
    [key: string]: GrammarSyntaxTree | Token
};

export type StackEntry = {
    rule: string,
    text: string
}