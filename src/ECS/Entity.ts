import { Dynamic } from "./Dynamic";
import { EntityID, PlainObject } from "./Types";

export class Entity extends Dynamic {
    constructor(name: EntityID, onChange: ((entity: EntityID, key: string, value: unknown) => void), values: PlainObject = {}) {
        super();
        
        Object.assign(this, values);
    }
}