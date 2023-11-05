import { Component } from "./component";
import { ComponentFields } from "./component-fields";
import { ComponentNotFoundError } from "./component-not-found-error";
import { Entity } from "./entity";
import { EntityBlueprint } from "./entity-blueprint";
import { ValueWithoutComponentError } from "./value-without-component-error";

export class Langine {
    private components = new Map<string, Component>();
    private entityBlueprints = new Map<string, EntityBlueprint>();
    private world: Entity[] = [];

    public registerComponent = (name: string, fields: ComponentFields): void => {
        this.components.set(name, new Component(fields));
    };

    public getComponent = (name: string): Component | undefined => {
        return this.components.get(name);
    };

    public registerEntityBlueprint = (name: string, values: any, ...componentTags: string[]): EntityBlueprint => {
        const entity = new EntityBlueprint();

        componentTags.forEach(componentTag => {
            const type = this.components.get(componentTag);

            if(type === undefined) throw new ComponentNotFoundError(componentTag);

            Object.assign(entity, type);
        });

        //is there a type not listed, but that we can infer through the values?
        this.components.forEach((value: Component, key: string) => {

        });
        
        //overwrite standard values with specific ones
        for(let key in values) {
            if(entity.getValue(key) !== undefined) {
                throw new ValueWithoutComponentError(key);
            }

            entity.setValue(key, values[key]);
        }

        this.entityBlueprints.set(name, entity);
        return entity;
    };

    public createEntity = (name: string): void => {
        this.world.push(name);
    };

    public getWorld = (): Entity[] => {
        return this.world;
    };
}