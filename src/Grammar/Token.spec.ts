import { expect } from "chai";
import { IdGenerator } from "../ECS/Types";
import { Token } from "./Token";

describe('Token Tests.', () => {
    it('A Token with a custom ID generator can be instantiated.', () => {
        let counter = 0;
        const generator: IdGenerator = () => {return (++counter).toString()};

        const token1 = new Token('Test-1-Type', 'Test-1-Name', generator);
        const token2 = new Token('Test-2-Type', 'Test-2-Name', generator);

        expect(token1.id).to.equal('1');
        expect(token2.id).to.equal('2');
    });
});