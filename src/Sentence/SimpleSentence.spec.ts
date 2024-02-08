import { expect } from "chai";
import { SimpleSentence } from "./SimpleSentence";
import { SentenceError } from "../Error/SentenceError";

describe('Simple Sentence.', () => {
    it('Can not have any references in its text.', () => {
        expect(() => new SimpleSentence('Some <<Token>> in here!')).to.throw(SentenceError);
        expect(() => new SimpleSentence('Some <<OtherToken@CustomName>> in here, too!')).to.throw(SentenceError);
    });
});