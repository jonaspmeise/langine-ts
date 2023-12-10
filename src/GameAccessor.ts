import { Action } from "./Action";
import { Component } from "./Component";
import { Entity } from "./Entity";
import { Game } from "./Game";
import { Guard } from "./Guard";
import { Player } from "./Player";
import { State } from "./State";
import { PlainObject } from "./Types";

export interface GameAccessor {
    addComponentToEntity(entity: Entity | string, component: Component | string, values?: PlainObject): Entity;

    registerComponent(name: string, optional?: {
        parents?: (Component | string)[],
        values?: PlainObject
    }): Component;
    spawnEntity(components: (Component | string)[], optional?: {
        name?: string,
        values?: PlainObject
    }): Entity;

    findComponentById(name: string): Component;
    findEntityById(name: string): Entity;
    findEntitiesByComponent(component: (Component | string) | (Component | string)[]): Entity[];

    findEntitiesByFilter(filter: (...args: any[]) => boolean): Entity[];
    findEntitiesByFilter(filter: (...args: any[]) => boolean, enableCartesianCombinations: false): Entity[];
    findEntitiesByFilter(filter: (...args: any[]) => boolean, enableCartesianCombinations: true): Entity[][];

    registerState(name: string): State;
    registerAction(
            name: string, 
            language: string | ((...words: Entity[]) => string), //can also be type Game
            event: (...args: Entity[]) => void //? o_Ô
        ): Action;
    registerGuard(
        action: Action | string, 
        check: (...args: Entity[]) => boolean, 
        message?: string | ((...args: Entity[]) => string)
    ): Guard;

    start(): void;
    do(action: Action, player?: Player): void;
}