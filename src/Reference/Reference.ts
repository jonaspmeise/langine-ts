export class Reference {
    constructor(
        public readonly name: string,
        public readonly type: string[],
        public readonly id: ReferenceId = generateId()
    ) {}

    public toDefinition = (): string => {
        return '';
    };

    public static parseReferences = (text: string): References => {
        !!text;
        return new Map();
    };
}

export const generateId = (length: number = 32): ReferenceId => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let uuid = '';

    for (let i = 0; i < length; i++) {
        uuid += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    return uuid;
};

export type ReferenceId = string;

export type References = Map<ReferenceId, Reference>;