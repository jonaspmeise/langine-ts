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

export type StackEntry = {
    rule: string,
    text: string
};

export type IdGenerator = () => string;

export const defaultIdGenerator: IdGenerator = (length: number = 32): string => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let uuid = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        uuid += letters.charAt(randomIndex);
    }

    return uuid;
};