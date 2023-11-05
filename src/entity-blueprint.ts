export class EntityBlueprint {
    private values:  any = {};
    private tags: Set<string> = new Set();

    getTags = (): Set<string> => {
        return this.tags;
    }

    setValue = (name: string, value: any): void => {
        this.values[value] = name;
    }

    getValue = (name: string): any => {
        return this.values[name];
    }
}