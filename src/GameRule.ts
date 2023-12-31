export class GameRule {
    private rule: string;

    constructor(rule: string) {
        //Sanitize rule
        this.rule = rule
            .trim()
            .replace(new RegExp('\\n', 'g'), ' ');

        console.log('Constructed Rule:', this.rule);
    }
}