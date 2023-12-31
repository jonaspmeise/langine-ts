export class InvalidRuleException extends Error {
    constructor(message: string) {
        super(message);
    }

    public static matchesNothing(rule: string) {
        throw new InvalidRuleException(`The Game Rule "${rule}" can't be matched to any of the initial Grammar Rules!`);
    }
}