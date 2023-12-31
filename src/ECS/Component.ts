import { Dynamic } from "./Dynamic";
import { PlainObject } from "./Types";

export class Component extends Dynamic {
    constructor(values: PlainObject = {}) {
        super();

        Object.assign(this, values);
    }
}