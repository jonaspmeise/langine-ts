import { randomUUID } from "crypto";
import { Action } from "./Action";
import { Component } from "./Component";
import { Entity } from "./Entity";
import { GameAccessor } from "./GameAccessor";
import { InvalidComponentException } from "./InvalidComponentException";
import { MissingSetupException } from "./MissingSetupException";
import { NonExistingException } from "./NonExistingException";
import { Player } from "./Player";
import { State } from "./State";
import { ID, PlainObject } from "./Types";
import { InvalidEntityException } from "./InvalidEntityException";

export class Game implements GameAccessor {
    private idByComponent: Map<Component, ID> = new Map();
    private idByEntity: Map<Entity, ID> = new Map();

    private componentById: Map<ID, Component> = new Map();
    private entityById: Map<ID, Entity> = new Map();

    private entitiesByComponent: Map<ID, Set<ID>> = new Map();
    private componentsByEntity: Map<ID, Set<ID>> = new Map();

    private parentsByComponent: Map<ID, Set<ID>> = new Map();

    constructor(private players: Player[]) {}
    
    public registerComponent = (name: string, optional?: { parents?: (string | Component)[], values?: PlainObject}): Component => {
        //set default values
        optional = optional || {};
        optional.parents = optional.parents || [];
        optional.values = optional.values || {};

        if(this.componentById.has(name)) throw new InvalidComponentException(`Component could not be registered: A Component with the name "${name}" already exists!`);

        //unify & validate parent-references
        const parents = optional.parents.map((parentComponent) => {
            if(typeof parentComponent == 'string') {
                const component = this.componentById.get(parentComponent)

                if(component === undefined) throw new MissingSetupException(`The Component "${parentComponent}" does not exist! Did you already register it?`);
                return component;
            }

            if(!this.idByComponent.has(parentComponent)) throw new MissingSetupException(`The Component "${JSON.stringify(parentComponent)}" is not registered. Did you already register it?`);     
            return parentComponent;
        });

        //accumulate values from all parents and from the object itself
        const values = parents.reduce((acc, current) => Object.assign(acc, current), {});
        Object.assign(values, optional.values);

        const component = new Component(values);

        //write changes
        this.componentById.set(name, component);
        this.idByComponent.set(component, name);
        this.parentsByComponent.set(name, new Set(parents.map((parentComponent) => this.idByComponent.get(parentComponent)!)));

        return component;
    }

    public spawnEntity = (components: (string | Component)[], optional?: { name?: string, values?: PlainObject}): Entity => {
        //set default values
        optional = optional || {};
        const name = optional.name || randomUUID();
        optional.values = optional.values || {};

        if(this.entityById.has(name)) throw new InvalidEntityException(`An Entity with the name "${optional.name}" already exists! Please consider using another Name or let it automatically generate an ID.`);
        if(components.length == 0) throw new InvalidEntityException(`The Entity "${optional.name}" can't be spawned without any Base Components! Consider defining some Base Components.`);

        //unify & validate component-references
        const componentDefinitions = components.map((baseComponent) => {
            if(typeof baseComponent == 'string') {
                const component = this.componentById.get(baseComponent);

                if(component === undefined) throw new MissingSetupException(`The Component "${baseComponent}" does not exist! Did you already register it?`);
                return component;
            }

            if(!this.idByComponent.has(baseComponent)) throw new MissingSetupException(`The Component "${JSON.stringify(baseComponent)}" is not registered. Did you already register it?`);     
            return baseComponent;
        });

        //accumulate values from all components and from the initial values itself
        const values = componentDefinitions.reduce((acc, current) => Object.assign(acc, current), {});

        const unnecessaryValues = Object.keys(optional.values).filter((key) => !(key in values));
        if(unnecessaryValues.length > 0) throw new InvalidEntityException(`The Entity "${optional.name}" is defining values which can not be matched to belong to any of its Components "${componentDefinitions.map((component) => this.idByComponent.get(component))}": "${unnecessaryValues}`)

        Object.assign(values, optional.values);
        if(Object.values(values).includes(undefined)) throw new MissingSetupException(`The values "${Object.entries(values).filter(([_, value]) => value === undefined).map(([key, value]) => key)}" of the Entity "${optional.name}" are not set. Since they are required values from the Components, you need to initialize them!`);
        
        const entity = new Entity(values);

        //write back values
        this.entityById.set(name, entity);
        componentDefinitions
            .map((component) => this.idByComponent.get(component)!)
            .forEach((id) => {
                if(!this.entitiesByComponent.has(id)) this.entitiesByComponent.set(id, new Set());
                
                this.entitiesByComponent.set(id, this.entitiesByComponent.get(id)!.add(name))
            });

        return entity;
    };

    public addComponentToEntity = (entity: string | Entity, component: string | Component, values?: PlainObject | undefined): Entity => {
        throw new Error("Method not implemented.");
    };

    public findComponentById = (name: string): Component => {
        const component = this.componentById.get(name);

        if(component === undefined) throw new NonExistingException(`The Component "${name}" does not exist! Did you register it already?`);
        return component;
    };

    public findEntityById = (name: string): Entity => {
        throw new Error("Method not implemented.");
    };

    public findEntitiesByComponent = (component: string | Component | (string | Component)[]): Entity[] => {
        throw new Error("Method not implemented.");
    };

    public findEntitiesByFilter(filter: (...args: any[]) => boolean): Entity[];
    public findEntitiesByFilter(filter: (...args: any[]) => boolean, enableCartesianCombinations: false): Entity[];
    public findEntitiesByFilter(filter: (...args: any[]) => boolean, enableCartesianCombinations: true): Entity[][];
    public findEntitiesByFilter(filter: (...args: any[]) => boolean, enableCartesianCombinations?: unknown): Entity[] | Entity[][] {
        throw new Error("Method not implemented.");
    }

    public getActions = (player: Player): Action[] => {
        return [];
    };

    public registerState = (name: string): State => {
        throw new Error("Method not implemented.");
    };
    
    public registerAction = (name: string, language: string | ((...words: Entity[]) => string), event: (...args: Entity[]) => void): Action => 
    {
        throw new Error("Method not implemented.");
    };

    public registerGuard = (action: string | Action, check: (...args: Entity[]) => boolean, message?: string | ((...args: Entity[]) => string)) => {
        throw new Error("Method not implemented.");
    };
    
    public start = (): void => {
        throw new Error("Method not implemented.");
    };

    public do = (action: Action, player?: Player | undefined): void =>  {
        throw new Error("Method not implemented.");
    };
}