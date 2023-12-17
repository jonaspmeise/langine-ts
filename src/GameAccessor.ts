import { Action } from "./Action";
import { Component } from "./Component";
import { Entity } from "./Entity";
import { Guard } from "./Guard";
import { Player } from "./Player";
import { State } from "./State";
import { ActionID, ComponentID, EntityID, PlainObject, PlayerID, StateID } from "./Types";

export interface GameAccessor {
    addComponentToEntity(entity: EntityID | Entity, component: ComponentID | Component, values?: PlainObject): Entity;

    registerComponent(name: ComponentID, optional?: {
        parents?: (ComponentID | Component)[],
        values?: PlainObject
    }): Component;
    spawnEntity(components: (ComponentID | Component)[], optional?: {
        name?: ComponentID,
        values?: PlainObject
    }): Entity;

    findComponentById(name: ComponentID): Component;
    findEntityById(name: EntityID): Entity;

    queryEntities(filter: (ComponentID | Component) | (ComponentID | Component)[] | ((...args: any[]) => boolean)): Set<Entity>;
    queryEntities(filter: (ComponentID | Component) | (ComponentID | Component)[] | ((...args: any[]) => boolean), returnCombinations: false): Set<Entity>;
    queryEntities(filter: (ComponentID | Component) | (ComponentID | Component)[] | ((...args: any[]) => boolean), returnCombinations: true): Set<Entity[]>;

    registerState(name: StateID): State;
    registerAction(
            name: ActionID, 
            language: string | ((...words: Entity[]) => string), //can also be type Game
            event: (...args: Entity[]) => void //? o_Ô
        ): ((...args: Entity[]) => void);
    registerGuard(
        action: ActionID, 
        check: (...args: Entity[]) => boolean, 
        message?: string | ((...args: Entity[]) => string)
    ): Guard;

    step(): void;
    do(action: Action, ...parameter: EntityID[]): void;
    getActions(player?: PlayerID | Player): [ActionID, EntityID[]][];
}