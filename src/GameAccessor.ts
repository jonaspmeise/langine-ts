import { Action } from "./Action";
import { Component } from "./Component";
import { Entity } from "./Entity";
import { Guard } from "./Guard";
import { Player } from "./Player";
import { State } from "./State";
import { ID, PlainObject } from "./Types";

export interface GameAccessor {
    addComponentToEntity(entity: Entity | ID, component: Component | ID, values?: PlainObject): Entity;

    registerComponent(name: ID, optional?: {
        parents?: (Component | ID)[],
        values?: PlainObject
    }): Component;
    spawnEntity(components: (Component | ID)[], optional?: {
        name?: ID,
        values?: PlainObject
    }): Entity;

    findComponentById(name: ID): Component;
    findEntityById(name: ID): Entity;

    queryEntities(filter: (Component | ID) | (Component | ID)[] | ((...args: any[]) => boolean)): Set<Entity>;
    queryEntities(filter: (Component | ID) | (Component | ID)[] | ((...args: any[]) => boolean), returnCombinations: false): Set<Entity>;
    queryEntities(filter: (Component | ID) | (Component | ID)[] | ((...args: any[]) => boolean), returnCombinations: true): Set<Entity[]>;

    registerState(name: ID): State;
    registerAction(
            name: ID, 
            language: string | ((...words: Entity[]) => string), //can also be type Game
            event: (...args: Entity[]) => void //? o_Ô
        ): Action;
    registerGuard(
        action: Action | ID, 
        check: (...args: Entity[]) => boolean, 
        message?: string | ((...args: Entity[]) => string),
        name?: ID
    ): Guard;

    start(): void;
    do(action: Action, player?: Player): void;
}