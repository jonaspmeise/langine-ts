export const isReferenceArray = (value: unknown[]): value is string[] => {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

export const cartesianProduct = <T>(arrays: (T[] | Set<T>)[]): T[][] => {
    if (!arrays || arrays.length === 0) {
      return [[]];
    }

    if(arrays[0] instanceof Set) arrays = arrays.map((set) => [...set]);
  
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
};

export const intersection = <T> (...sets: Set<T>[]): Set<T> => {
    if (sets.length === 0) {
        return new Set();
    }

    const result = new Set(sets[0]);
  
    result.forEach((value) => {
        sets.forEach((otherSet) => {
            if(!otherSet.has(value)) result.delete(value);

            return;
        });

        if(result.size == 0) return;
    });
  
    return result;
  };

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

export const getAllCombinations = <K,V> (map: Map<K, Set<V>>): [K, V][] => {
    const combinations: [K, V][] = [];

    if(!map) return [];
  
    map.forEach((valueSet, key) => {
        valueSet.forEach((value) => {
            combinations.push([key, value]);
        });
    });
  
    return combinations;
};

export const getFunctionParameters = (event: Function | ((args: any[]) => any)): string[] => {
    return (event.toString().split('=>')[0]).match(/[a-z0-9_]+/gi)! || [];
};

export const findDuplicates = <T>(arr: T[]): T[] => {
    const set = new Set<T>();
    const duplicates: T[] = [];
  
    arr.forEach((item) => {
        if (set.has(item)) {
            duplicates.push(item);
        } else {
            set.add(item);
        }
    });
  
    return duplicates;
};

export const cleanYamlString = (yaml: string): string => {
    return yaml.replace(new RegExp('^\\s+(?=\\S)', 'gm'), '');
};

export const escapeRegex = (string: string): string => {
    return string.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&');
};

export const generateCombinations = <T> (tokens: T[], repeat: number): T[][] => {
    const product = <T> (array: T[], repeat: number): T[][] => {
        if (repeat === 0) return [[]];

        const result: T[][] = [];
        const rest = product(array, repeat - 1);

        array.forEach((item) => rest.forEach((combination) => result.push([item, ...combination])))

        return result;
    };

    return product(tokens, repeat);
};

export const interweave = (parts: string[], connectors: string[]): string => {
    if (connectors.length !== parts.length - 1) {
        throw new Error('Invalid input arrays');
    }

    const result: string[] = [];
    for (let i = 0; i < parts.length; i++) {
        result.push(parts[i]);

        if (i < connectors.length) {
            result.push(connectors[i]);
        }
    }

    return result.join('');
};