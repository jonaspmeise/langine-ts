import { expect } from "chai";
import { Reference } from "./Reference";
import { InvalidReferenceError } from "../Error/InvalidReferenceError";

describe('Reference.', () => {
    it('ID is automatically generated.', () => {
        expect(new Reference('123', ['123'], 'does not matter').id).to.not.be.undefined;
    });

    it('toRenderString() returns the Reference-ID.', () => {
        expect(new Reference('123', ['123'], '123', 'my-custom-id').toRenderString()).to.deep.equal('<<my-custom-id>>');
    });

    describe('parseReferences() works.', () => {
        const testCases: {description: string, text: string, expectedReferences: Reference[]}[] = [
            {
                description: 'A simple Reference is parsed correctly.',
                text: 'This Sentence contains a <<Token>>.', 
                expectedReferences: [
                    new Reference('Token', ['Token'], 'Token')
                ]
            },
            {
                description: 'Two References are both parsed correctly.',
                text: 'This Sentence contains a <<Token>> and another <<Token2>>.', 
                expectedReferences: [
                    new Reference('Token', ['Token'], 'Token'),
                    new Reference('Token2', ['Token2'], 'Token2')
                ]
            },
            {
                description: 'A Reference with a custom name is parsed correctly.',
                text: 'This Sentence contains a <<Token@customName>>.', 
                expectedReferences: [
                    new Reference('customName', ['Token'], 'Token@customName')
                ]
            },
            {
                description: 'Two References with custom names are parsed correctly.',
                text: '<<Token3@Token>><<Token@Token3>>.', 
                expectedReferences: [
                    new Reference('Token3', ['Token'], 'Token3@Token'),
                    new Reference('Token', ['Token3'], 'Token@Token3')
                ]
            }
        ];

        testCases.forEach((testCase) => {
            it(`${testCase.description}: "${testCase.text}" => ${testCase.expectedReferences.length} References.`, () => {
                const references = Reference.parseReferences(testCase.text);

                expect(references).to.not.be.undefined;
                
                testCase.expectedReferences.forEach((reference) => {
                    const matchingReference = Array.from(references!.values()).find((foundReference) => {
                        return reference.name === foundReference.name
                            && reference.types[0] === foundReference.types[0]
                    });

                    expect(matchingReference).to.not.be.undefined;
                });
            })
        });
    });

    describe('from() works.', () => {
        const testCases: {description: string, expectedReference: Reference}[] = [
            {description: 'Token', expectedReference: new Reference('Token', ['Token'], 'Token')},
            {description: 'Token@Name', expectedReference: new Reference('Name', ['Token'], 'Token@Name')},
        ];

        testCases.forEach((testCase) => {
            it(`"${testCase.description}" works.`, () => {
                const parsedReference = Reference.from(testCase.description);

                expect(parsedReference.definition).to.deep.equal(testCase.expectedReference.definition);
                expect(parsedReference.name).to.deep.equal(testCase.expectedReference.name);
                expect(parsedReference.types).to.deep.equal(testCase.expectedReference.types);
            });
        });
    });

    describe('Errors.', () => {
        it('References need to have atleast one Type.', () => {
            expect(() => new Reference('Test', [], 'does not matter')).to.throw(InvalidReferenceError);
        });

        it('References with a wrong naming schema are not allowed. They either have to be [TYPE] or [TYPE@NAME].', () => {
            expect(() => Reference.parseReferences('<<Test@Name@Error>> is wrong!')).to.throw(InvalidReferenceError);
        });

        it('References can not share custom names within a Sentence.', () => {
            expect(() => Reference.parseReferences('A <<Token@CustomName>> is not allowed to be combined with <<AnotherType@CustomName>>!')).to.throw(InvalidReferenceError);
        });

        it('References that have no custom names, but identical types, are not allowed. A custom name has to be given to one (or both) of them.', () => {
            expect(() => Reference.parseReferences('A <<Token>> and a <<Token>> cause much confusion!')).to.throw(InvalidReferenceError);

            Reference.parseReferences('A <<Token@Token1>> and a <<Token@Token2>> are allowed!');
        });

        describe('Tokens may not have special characters in their names or types.', () => {
            const testCases: {wrongSymbol: string, text: () => Reference}[] = [
                {wrongSymbol: '#', text: () => new Reference('#Name', ['Type'], 'does not matter')},
                {wrongSymbol: '#', text: () => new Reference('Name', ['#Type'], 'does not matter')},
                {wrongSymbol: '<', text: () => new Reference('Name', ['<Type'], 'does not matter')},
                {wrongSymbol: '>', text: () => new Reference('Name>', ['Type'], 'does not matter')},
                {wrongSymbol: '!', text: () => new Reference('Name!', ['Type'], 'does not matter')},
                {wrongSymbol: '?', text: () => new Reference('Name', ['Type??'], 'does not matter')},
                {wrongSymbol: '-', text: () => new Reference('Name', ['Type-Type'], 'does not matter')},
                {wrongSymbol: ';', text: () => new Reference('Name;', ['#Type'], 'does not matter')},
                {wrongSymbol: ':', text: () => new Reference('Name', ['Type:'], 'does not matter')},
                {wrongSymbol: '.', text: () => new Reference('Name.', ['Type'], 'does not matter')},
                {wrongSymbol: '"', text: () => new Reference('"Name"', ['Type'], 'does not matter')},
                {wrongSymbol: '\'', text: () => new Reference('\'Name\'', ['Type'], 'does not matter')},
                {wrongSymbol: '[WHITESPACE]', text: () => new Reference('Name   ', ['Type'], 'does not matter')}
            ];

            testCases.forEach((testCase) => {
                it(`Symbol "${testCase.wrongSymbol}" is not allowed.`, () => {
                    expect(() => testCase.text()).to.throw(InvalidReferenceError);
                });
            });
        });
    });
});