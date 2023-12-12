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
import { cartesianProduct, intersection } from "./Util";

export class Game implements GameAccessor {
    private idByComponent: Map<Component, ID> = new Map();
    private idByEntity: Map<Entity, ID> = new Map();

    private componentById: Map<ID, Component> = new Map();
    private entityById: Map<ID, Entity> = new Map();

    private entitiesByComponent: Map<ID, Set<ID>> = new Map();
    private componentsByEntity: Map<ID, Set<ID>> = new Map();

    private parentsByComponent: Map<ID, Set<ID>> = new Map();

    constructor(private players: Player[]) {}
    
    public registerComponent = (name: ID, optional?: { parents?: (string | Component)[], values?: PlainObject}): Component => {
        //set default values
        optional = optional || {};
        const parents = optional.parents || [];
        optional.values = optional.values || {};

        if(this.componentById.has(name)) throw new InvalidComponentException(`Component could not be registered: A Component with the name "${name}" already exists!`);

        //unify & validate parent-references
        const parentDefinitions = this.validateAndUnifyParents(parents);

        //accumulate values from all parents and from the object itself
        const values = parentDefinitions.reduce((acc, current) => Object.assign(acc, current), {});
        Object.assign(values, optional.values);

        const component = new Component(values);

        //write changes
        this.componentById.set(name, component);
        this.idByComponent.set(component, name);
        this.parentsByComponent.set(name, new Set(parentDefinitions.map((parentComponent) => this.idByComponent.get(parentComponent)!)));

        return component;
    }

    public spawnEntity = (components: (ID | Component)[], optional?: { name?: string, values?: PlainObject}): Entity => {
        //set default values
        optional = optional || {};
        const name = optional.name || randomUUID();
        optional.values = optional.values || {};

        if(this.entityById.has(name)) throw new InvalidEntityException(`An Entity with the name "${optional.name}" already exists! Please consider using another Name or let it automatically generate an ID.`);
        if(components.length == 0) throw new InvalidEntityException(`The Entity "${optional.name}" can't be spawned without any Base Components! Consider defining some Base Components.`);

        //unify & validate component-references
        const componentDefinitions = this.validateAndUnifyParents(components);
        const componentIds = componentDefinitions.map((component) => this.idByComponent.get(component)!);

        //accumulate values from all components and from the initial values itself
        const values = componentDefinitions.reduce((acc, current) => Object.assign(acc, current), {});

        const unnecessaryValues = Object.keys(optional.values).filter((key) => !(key in values));
        if(unnecessaryValues.length > 0) throw new InvalidEntityException(`The Entity "${optional.name}" is defining values which can not be matched to belong to any of its Components "${componentDefinitions.map((component) => this.idByComponent.get(component))}": "${unnecessaryValues}`)

        Object.assign(values, optional.values);
        if(Object.values(values).includes(undefined)) throw new MissingSetupException(`The values "${Object.entries(values).filter(([_, value]) => value === undefined).map(([key, value]) => key)}" of the Entity "${optional.name}" are not set. Since they are required values from the Components, you need to initialize them!`);
        
        const entity = new Entity(values);

        //write changes
        this.entityById.set(name, entity);
        this.idByEntity.set(entity, name);
        this.componentsByEntity.set(name, new Set(componentIds));

        componentIds.forEach((id) => {
            if(!this.entitiesByComponent.has(id)) this.entitiesByComponent.set(id, new Set());

            this.entitiesByComponent.set(id, this.entitiesByComponent.get(id)!.add(name))
        });

        return entity;
    };

    private validateAndUnifyParents = (components: (ID | Component)[]): Component[] => {
        return components.map((baseComponent) => {
            if(typeof baseComponent == 'string') {
                const component = this.componentById.get(baseComponent);

                if(component === undefined) throw new MissingSetupException(`The Component "${baseComponent}" does not exist! Did you already register it?`);
                return component;
            }

            if(!this.idByComponent.has(baseComponent)) throw new MissingSetupException(`The Component "${JSON.stringify(baseComponent)}" is not registered. Did you already register it?`);     
            return baseComponent;
        });
    };
    
    queryEntities(filter?: ID | Component | (ID | Component)[] | ((...args: any[]) => boolean)): Set<Entity>;
    queryEntities(filter: ID | Component | (ID | Component)[] | ((...args: any[]) => boolean), returnCombinations: false): Set<Entity>;
    queryEntities(filter: ID | Component | (ID | Component)[] | ((...args: any[]) => boolean), returnCombinations: true): Set<Entity[]>;
    queryEntities(filter?: ID | Component | (ID | Component)[] | ((...args: any[]) => boolean), returnCombinations: boolean = false): Set<Entity> | Set<Entity[]> {
        //case 1: Filter is unknown; return all Entities
        if(filter === undefined) return new Set(this.entityById.values());

        let componentsToQuery: ID[] = [];

        //case 2: Filter is a function
        if(typeof filter == 'function') {
            //figure out which components to query (from function definition)
            const args = (filter.toString().split('=>')[0]).match(/[a-z0-9_]+/gi)!;

            //default: return all Entities
            if(args == null) return new Set(this.entityById.values());

            componentsToQuery = args as ID[];
        } else {
            let collector: (ID | Component)[];
            //case 3: Filter is an Array
            Array.isArray(filter) ? collector = filter : collector = [filter];

            componentsToQuery = collector.map((element) => {
                if(element instanceof Component) return this.idByComponent.get(element)!;

                return element;
            })
        }

        const entityIDsPerComponent = componentsToQuery.map((id) => {
            const entityIDs = this.entitiesByComponent.get(id);

            if(entityIDs == undefined) throw new InvalidComponentException(`You can not query over a Component "${id}" which has not been registered yet! Did you already define it?`);      
            return entityIDs;
        });
        
        if(!returnCombinations) {
            //only the entities that match ALL IDs are important
            const entities: Set<Entity> = new Set();

            [...intersection<ID>(...entityIDsPerComponent)].forEach((id) => entities.add(this.entityById.get(id)!));
            if(typeof filter == 'function') return new Set([...entities].filter((entity => (filter as Function)(entity))));

            return entities;
        } else { //FIXME: Grade A Spaghetto
            let cartesian = cartesianProduct(entityIDsPerComponent.map((set) => [...set]))
                .map((IDs) => IDs.map((id) => this.entityById.get(id)!));

            //We may additionally apply a filter function
            if(typeof filter == 'function') cartesian = cartesian
                .filter((args) => (filter as Function)(...args));
            
            return new Set(cartesian);
        }
    }

    public addComponentToEntity = (entity: ID | Entity, component: ID | Component, values?: PlainObject | undefined): Entity => {
        throw new Error("Method not implemented.");
    };

    public findComponentById = (name: ID): Component => {
        const component = this.componentById.get(name);

        if(component === undefined) throw new NonExistingException(`The Component "${name}" does not exist! Did you register it already?`);
        return component;
    };

    public findEntityById = (name: ID): Entity => {
        throw new Error("Method not implemented.");
    };

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