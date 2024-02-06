import { expect } from "chai";
import { Sentence } from "./Sentence";

describe('Sentence.', () => {
    const testCases: {text: string, hasReferences: boolean, hasNormalTokens: boolean}[] = [
        {text: '<<Something>> is a Reference.', hasReferences: true, hasNormalTokens: true},
        {text: '<<Something>> is a Reference to <<SomethingElse>>', hasReferences: true, hasNormalTokens: true},
        {text: 'A <<Component@CustomName>> is a custom Component!', hasReferences: true, hasNormalTokens: true},
        {text: '<<Token>>', hasReferences: true, hasNormalTokens: false},
        {text: '<<Token@CustomName>>', hasReferences: true, hasNormalTokens: false},
        {text: 'This is some simple text. Okay?', hasReferences: false, hasNormalTokens: true},
        {text: '<<Token1>><<Token2>>', hasReferences: true, hasNormalTokens: false}
    ];

    describe('hasReferences() works correctly.', () => {
        testCases.forEach((testCase) => {
            it(`"${testCase.text}" => ${testCase.hasReferences}`, () => {
                expect(Sentence.hasReferences(testCase.text)).to.equal(testCase.hasReferences);
            });
        });
    });

    describe('hasNormalTokens() works correctly.', () => {
        testCases.forEach((testCase) => {
            it(`"${testCase.text}" => ${testCase.hasNormalTokens}`, () => {
                expect(Sentence.hasNormalTokens(testCase.text)).to.equal(testCase.hasNormalTokens);
            });
        });
    });
});