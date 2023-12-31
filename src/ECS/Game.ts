import { randomUUID } from "crypto";
import { Action } from "./Action";
import { Component } from "./Component";
import { Entity } from "./Entity";
import { GameAccessor } from "./GameAccessor";
import { InvalidComponentException } from "../Exceptions/InvalidComponentException";
import { MissingSetupException } from "../Exceptions/MissingSetupException";
import { NonExistingException } from "../Exceptions/NonExistingException";
import { Player } from "./Player";
import { State } from "./State";
import { ActionFunction, ActionID, ComponentID, EntityID, GuardID, PlainObject, PlayerID, StateID } from "./Types";
import { InvalidEntityException } from "../Exceptions/InvalidEntityException";
import { cartesianProduct, getAllCombinations, getFunctionParameters, intersection } from "../Util";
import { InvalidActionException } from "../Exceptions/InvalidActionException";
import { Guard } from "./Guard";

export class Game implements GameAccessor {
    private iteration: number = 0;

    public idByComponent: Map<Component, ComponentID> = new Map();
    public idByEntity: Map<Entity, EntityID> = new Map();
    public proxyToEntity: Map<ProxyHandler<Entity>, EntityID> = new Map();

    public playerByID: Map<PlayerID, Player> = new Map();
    public idByPlayer: Map<Player, PlayerID> = new Map();
    
    public actionById: Map<ActionID, Action> = new Map();
    public actionsByPlayer: Map<PlayerID, Map<ActionID, Set<EntityID[]>>> = new Map();
    public allActions: Map<ActionID, Set<EntityID[]>> = new Map();

    public componentById: Map<ComponentID, Component> = new Map();
    public entityById: Map<EntityID, Entity> = new Map();

    public entitiesByComponent: Map<ComponentID, Set<EntityID>> = new Map();
    public componentsByEntity: Map<EntityID, Set<ComponentID>> = new Map();

    public parentsByComponent: Map<ComponentID, Set<ComponentID>> = new Map();
    public childrenByComponent: Map<ComponentID, Set<ComponentID>> = new Map();

    public guardForAction: Map<ActionID, Set<GuardID>> = new Map();
    public guardById: Map<GuardID, Guard> = new Map();

    constructor(private initialPlayers: Player[]) {
        if(initialPlayers.length == 0) throw new MissingSetupException(`You can\'t start a Game without atleast 1 Player!`);

        this.registerComponent('Player', {values: {player: undefined}});
        this.registerComponent('Game');
    }
    
    public registerPlayer = (player: Player): Player => {
        const id = player.name;

        this.playerByID.set(id, player);
        this.idByPlayer.set(player, id);

        return player;
    }

    public registerComponent = (name: ComponentID, optional?: { parents?: (string | Component)[], values?: PlainObject}): Component => {
        //set default values
        optional = optional || {};
        const parents = optional.parents || [];
        optional.values = optional.values || {};

        if(this.componentById.has(name)) throw new InvalidComponentException(`Component could not be registered: A Component with the name "${name}" already exists!`);

        //unify & validate parent-references
        const parentDefinitions = this.validate(parents);

        //accumulate values from all parents and from the object itself
        const values = parentDefinitions.reduce((acc, current) => Object.assign(acc, current), {});
        Object.assign(values, optional.values);

        const component = new Component(values);

        //write changes
        this.componentById.set(name, component);
        this.idByComponent.set(component, name);
        this.entitiesByComponent.set(name, new Set());

        this.parentsByComponent.set(name, new Set(parentDefinitions.map((parentComponent) => {
            //update parent->child reference
            const parentID = this.idByComponent.get(parentComponent)!;
            this.childrenByComponent.set(parentID, (this.childrenByComponent.get(parentID) ?? new Set).add(name));

            return parentID;
        })));

        return component;
    }

    public spawnEntity = (components: (EntityID | Component)[], optional?: { name?: string, values?: PlainObject}): Entity => {
        //set default values
        optional = optional || {};
        optional.values = optional.values || {};

        //only when setting the Name/ID manually
        if(optional.name !== undefined && this.entityById.has(optional.name)) throw new InvalidEntityException(`An Entity with the name "${optional.name}" already exists! Please consider using another Name or let it automatically generate an ID.`);
        
        if(components.length == 0) throw new InvalidEntityException(`The Entity "${optional.name}" can't be spawned without any Base Components! Consider defining some Base Components.`);

        //unify & validate component-references
        const componentDefinitions = this.validate(components);
        const componentIds = componentDefinitions.map((component) => this.idByComponent.get(component)!);

        //add components to automatically generated name to make it more expressive
        const name = optional.name || `${componentIds.join('_')}-${randomUUID()}`

        //accumulate values from all components and from the initial values itself
        const values = componentDefinitions.reduce((acc, current) => Object.assign(acc, current), {});

        const unnecessaryValues = Object.keys(optional.values).filter((key) => !(key in values));
        if(unnecessaryValues.length > 0) throw new InvalidEntityException(`The Entity "${optional.name}" is defining values which can not be matched to belong to any of its Components "${componentDefinitions.map((component) => this.idByComponent.get(component))}": "${unnecessaryValues}`)

        Object.assign(values, optional.values);
        if(Object.values(values).includes(undefined)) throw new MissingSetupException(`The values "${Object.entries(values).filter(([_, value]) => value === undefined).map(([key, value]) => key)}" of the Entity "${optional.name}" are not set. Since they are required values from the Components, you need to initialize them!`);
        
        const entity = new Entity(name, this.registerAttributeChange, values);

        //write changes
        this.entityById.set(name, entity);
        this.idByEntity.set(entity, name);
        this.componentsByEntity.set(name, new Set(componentIds));

        componentIds.forEach((id) => {
            if(!this.entitiesByComponent.has(id)) this.entitiesByComponent.set(id, new Set());

            this.entitiesByComponent.set(id, this.entitiesByComponent.get(id)!.add(name));
        });

        return entity;
    };

    private registerAttributeChange = (id: EntityID, key: string, value: unknown): void => { //FIXME: instead of entityID ID<Entity>
        const entity = this.entityById.get(id)!; //FIXME: Is this true? Does it always exist?

        entity[key] = value;

        this.entityById.set(id, entity);
    };

    private validate = (components: (ComponentID | Component)[]): Component[] => {
        return components.map((baseComponent) => {
            if(!(baseComponent instanceof Component)) return this.findComponentById(baseComponent);

            if(!this.idByComponent.has(baseComponent)) throw new MissingSetupException(`The Component "${JSON.stringify(baseComponent)}" is not registered. Did you already register it?`);     
            return baseComponent;
        });
    };
    
    queryEntities(filter?: ComponentID | Component | (ComponentID | Component)[] | ((...args: any[]) => boolean)): Set<Entity>;
    queryEntities(filter: ComponentID | Component | (ComponentID | Component)[] | ((...args: any[]) => boolean), returnCombinations: false): Set<Entity>;
    queryEntities(filter: ComponentID | Component | (ComponentID | Component)[] | ((...args: any[]) => boolean), returnCombinations: true): Set<Entity[]>;
    queryEntities(filter?: ComponentID | Component | (ComponentID | Component)[] | ((...args: any[]) => boolean), returnCombinations: boolean = false): Set<Entity> | Set<Entity[]> {
        //case 1: Filter is unknown; return all Entities
        if(filter === undefined) return new Set([...this.entityById.values()]);

        let componentsToQuery: ComponentID[] = [];

        //case 2: Filter is a function
        if(typeof filter == 'function') {
            //figure out which components to query (from function definition)
            const args = getFunctionParameters(filter);

            //default: return all Entities
            if(args == null) return new Set(this.entityById.values());

            componentsToQuery = args as ComponentID[];
        } else {
            let collector: (ComponentID | Component)[];
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

            [...intersection<EntityID>(...entityIDsPerComponent)].forEach((id) => entities.add(this.entityById.get(id)!));
            if(typeof filter == 'function') return new Set([...entities]
                .filter((entity) => (filter as Function)(entity)));

            return entities;
        } else { //FIXME: Grade A Spaghetto
            let cartesian = cartesianProduct(entityIDsPerComponent.map((set) => [...set]))
                .map((IDs) => IDs.map((id) => this.entityById.get(id)!));

            //We may additionally apply a filter function
            if(typeof filter == 'function') cartesian = cartesian
                .filter((args) => (filter as Function)(...args));
            
            return new Set(cartesian);
        }
    };

    public addComponentToEntity = (entity: EntityID | Entity, component: ComponentID | Component, values: PlainObject | undefined = {}): Entity => {      
        if(entity instanceof Entity) {
            //since the "Entity" comes from outside and is a Proxy, we need to first fetch the real object
            const proxyRef = this.proxyToEntity.get(entity);
            if(proxyRef !== undefined) entity = this.entityById.get(proxyRef)!;

            const entityRef = this.idByEntity.get(entity);
            if(entityRef === undefined) throw new InvalidEntityException(`The Entity "${entity}" does not exist! Did you already spawn it?`);

            entity = entityRef;
        } else {
            if(!this.entityById.has(entity)) throw new InvalidEntityException(`The Entity "${entity}" does not exist! Did you already spawn it?`);
        }

        if(component instanceof Component) {
            const componentRef = this.idByComponent.get(component);
            if(componentRef === undefined) throw new InvalidComponentException(`The Entity "${entity}" does not exist! Did you already spawn it?`);

            component = componentRef;
        } else {
            if(!this.componentById.has(component)) throw new InvalidComponentException(`The Entity "${entity}" does not exist! Did you already spawn it?`);
        }

        if(!this.componentsByEntity.get(entity)!.has(component)) {
            const targetComponent = this.componentById.get(component)!;
            const targetEntity = this.entityById.get(entity)!;

            const unnecessaryValues = Object.keys(values).filter((key) => !(key in targetComponent));
            if(unnecessaryValues.length > 0) throw new InvalidEntityException(`To the Entity "${entity}" values are added which can not be matched to belong to the Component "${component}": "${unnecessaryValues}`);
    
            Object.assign(targetEntity, targetComponent);
            Object.assign(targetEntity, values);
            
            if(Object.values(targetEntity).includes(undefined)) throw new MissingSetupException(`The values "${Object.entries(targetEntity).filter(([_, value]) => value === undefined).map(([key, value]) => key)}" of the Entity "${entity}" are not set. Since they are required values from the Components, you need to initialize them!`);
           
            //write changes
            //this.entityById.set(entity, targetEntity); FIXME: Not necessary because of attribute changes done through Object.assign
            this.componentsByEntity.set(entity, this.componentsByEntity.get(entity)!.add(component));
            this.entitiesByComponent.set(component, this.entitiesByComponent.get(component)!.add(entity));
        }

        //default case: the Component is already added to the Entity
        return this.entityById.get(entity)!;
    };

    public findComponentById = (name: ComponentID): Component => {
        const component = this.componentById.get(name);

        if(component === undefined) throw new NonExistingException(`The Component "${name}" does not exist! Did you register it already?`);
        return component;
    };

    public findEntityById = (name: EntityID): Entity => {
        const entity = this.entityById.get(name);

        if(entity === undefined) throw new NonExistingException(`The Entity "${name}" does not exist! Did you register it already?`);
        return entity;
    };

    public getActions = (player?: PlayerID | Player): [ActionID, EntityID[]][] => {
        if(player === undefined) return getAllCombinations(this.allActions); //TODO: Fix this

        if(player instanceof Player) player = this.idByPlayer.get(player) as PlayerID;
        
        return getAllCombinations(this.actionsByPlayer.get(player)!);
    };

    private updateActions = (): void => {
        //reset all actions so far
        this.actionsByPlayer = new Map();
        this.allActions = new Map();
        [...this.playerByID.keys()].forEach((player) => this.actionsByPlayer.set(player, new Map()));

        //evaluate each action to see whether its applicable
        [...this.actionById.entries()].map(([actionID, action]) => {
            //get the components that can match this function
            const event = action.event;
            let includesPlayerComponent: boolean = false;

            const componentsToQuery: ComponentID[] = getFunctionParameters(event);
            
            //FIXME: This should be smoother and more elegant
            if(componentsToQuery[0] == 'Player') includesPlayerComponent = true;

            cartesianProduct(componentsToQuery.map((componentId) => this.entitiesByComponent.get(componentId)!))
                .map((combination) => combination.map((entityID) => this.findEntityById(entityID)))
                .filter((combination) => {
                    //TODO: Implement guards here!
                    return true;
                })
                .map((combination) => combination.map((entity) => this.idByEntity.get(entity)!))
                .forEach((combination) => {
                    if(includesPlayerComponent) {
                        const playerID = this.entityById.get(combination[0])!.player;
                        const combinationForAction: Map<ActionID, Set<EntityID[]>> = this.actionsByPlayer.get(playerID) ?? new Map();
                        const targetsForCombination: Set<EntityID[]> = combinationForAction.get(actionID) ?? new Set();
                        
                        targetsForCombination.add(combination);
                        combinationForAction.set(actionID, targetsForCombination);

                        //Map "inside"-Player (ingame-logic) to "outside"-Player (Framework-logic)
                        this.actionsByPlayer.set(playerID, combinationForAction);
                    }

                    const allCombinationForAction = this.allActions.get(actionID) ?? new Set();
                    allCombinationForAction.add(combination);
                    this.allActions.set(actionID, allCombinationForAction);
                });
        });
    };

    public registerState = (name: StateID): State => {
        throw new Error("Method not implemented.");
    };
    
    public registerAction = (name: ActionID, language: string | ((...words: Entity[]) => string), event: (...args: Entity[]) => void): ActionFunction => 
    {
        if(this.actionById.has(name)) throw new InvalidActionException(`The Action "${name}" already exists!`);
        
        const action = new Action(this, language, event);
        this.actionById.set(name, action);

        const abc = (...args: (Entity | EntityID)[]) => {
            const castArgs = args.map((arg) => {
                if(!(arg instanceof Entity)) arg = this.entityById.get(arg)!; //FIXME: Remove this ! here

                return arg;
            });
            
            event(...castArgs);
        }

        abc.actionId = name;

        //TODO: Return additional values here/call step()?
        //force updates of other componnets in the background? (update reference queries etc.)
        return abc;
    };

    public registerGuard = (action: ActionID | ActionFunction, check: (...args: Entity[]) => boolean, message?: string | ((...args: Entity[]) => string)) => {
        //Transform ActionFunctions into their respective Action Reference
        if(typeof action == 'function') action = action.actionId;
        
        const guard = new Guard(this, action, check, message);
        const guardID: GuardID = `Guard-${action}-${randomUUID()}`;

        this.guardById.set(guardID, guard);
        this.guardForAction.set(action, (this.guardForAction.get(action) || new Set()).add(guardID));

        //TODO: Return an "interface" for that method? Like e.g. Disable/Enable/Toggle Guard?
        //TODO: Should do this for __all__ return values?

        return guard;
    };
    
    public step = (): void => {
        //Initialize Standard Components and Entities at the start
        if(this.iteration == 0) {
            let gameComponent: ComponentID;

            if (this.childrenByComponent.has('Game')) {
                //Take the first "other" definition of Game (the first Child)
                gameComponent = [...this.childrenByComponent.get('Game')!][0];
            } else {
                gameComponent = 'Game';
            }
            
            this.spawnEntity([gameComponent]);

            let playerComponent: ComponentID;
            if (this.childrenByComponent.has('Player')) {
                //Take the first "other" definition of Game (the first Child)
                playerComponent = [...this.childrenByComponent.get('Player')!][0];
            } else {
                playerComponent = 'Player';
            }

            this.initialPlayers.forEach((player) => { 
                this.registerPlayer(player);
                this.spawnEntity([playerComponent], {values: {player: player.name}});
            });
        }

        this.updateActions();
        this.iteration++;
    };

    public do = (action: Action | ActionID, ...parameter: EntityID[]): void =>  {
        throw new Error("Method not implemented.");
    };

    public componentExists = (componentID: ComponentID): boolean => {
        return this.componentById.has(componentID);
    }
}