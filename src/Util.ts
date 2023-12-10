export function isReferenceArray(value: unknown[]): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function cartesianProduct<T>(arrays: T[][]): T[][] {
    if (!arrays || arrays.length === 0) {
      return [[]];
    }
  
    const result: T[][] = [];
  
    function generateCombinations(currentIndex: number, currentCombination: T[]): void {
        if (currentIndex === arrays.length) {
            result.push([...currentCombination]);
            return;
        }

        for (const value of arrays[currentIndex]) {
            currentCombination.push(value);
            generateCombinations(currentIndex + 1, currentCombination);
            currentCombination.pop();
        }
    }
  
    generateCombinations(0, []);
  
    return result;
}

export const createPlainObject = (originalObject: { [key: string]: any }): { [key: string]: any } => {
    if (!originalObject.hasOwnProperty('id')) {
        throw new Error("Original object must have an 'id' property.");
    }

    // Create a proxy object that excludes the 'id' property
    const plainObject = new Proxy(originalObject, {
        get(target, prop: string) {
            if (prop === 'id') {
                return undefined;
            }
            return target[prop];
        },
        set(target, prop: string, value) {
            target[prop] = value;

            if (prop !== 'id') {
                originalObject[prop] = value;
            }

            return true;
        },
    });

    return plainObject;
};