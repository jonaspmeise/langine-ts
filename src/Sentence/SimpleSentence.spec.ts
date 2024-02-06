import { expect } from "chai";
import { SimpleSentence } from "./SimpleSentence";
import { InvalidSentenceError } from "../Error/InvalidSentenceError";

describe('Simple Sentence.', () => {
    it('Can not have any references in its text.', () => {
        expect(() => new SimpleSentence('Some <<Token>> in here!')).to.throw(InvalidSentenceError);
        expect(() => new SimpleSentence('Some <<OtherToken@CustomName>> in here, too!')).to.throw(InvalidSentenceError);
    });
});