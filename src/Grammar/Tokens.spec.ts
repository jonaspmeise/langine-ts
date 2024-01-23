import { expect } from "chai";
import { Token } from "./Tokens";
import { InvalidTokenError } from "../Exceptions/InvalidTokenError";

describe('Tokens.', () => {
    it('Simple Tokens can be instantiated.', () => {
        const token = new Token('Player');

        expect(token.references).to.be.empty;
        expect(token.text).to.deep.equal('Player');
        expect(token.isSimpleToken()).to.be.true;
        expect(token.isTypeToken()).to.be.false;
        expect(token.isMixedToken()).to.be.false;
    });

    it('Type Tokens can be instantiated.', () => {
        const token = new Token('<<Consists>>');

        expect(token.references).to.have.keys('Consists');
        expect(token.text).to.deep.equal('<<Consists>>');
        expect(token.isSimpleToken()).to.be.false;
        expect(token.isTypeToken()).to.be.true;
        expect(token.isMixedToken()).to.be.false;
    });

    it('Mixed Tokens can be instantiated.', () => {
        const token = new Token('<<Component>> <<destroys>> <<Entity>>');

        expect(token.references).to.have.keys('Component', 'destroys', 'Entity');
        expect(token.text).to.deep.equal('<<Component>> <<destroys>> <<Entity>>');
        expect(token.isSimpleToken()).to.be.false;
        expect(token.isTypeToken()).to.be.false;
        expect(token.isMixedToken()).to.be.true;
    });

    it('Mixed Tokens with named References can be instantiated.', () => {
        const token = new Token('<<Component@A>> <<consists>> <<Component@B>>');

        expect(token.references).to.have.keys('A', 'consists', 'B');
        expect(token.text).to.deep.equal('<<Component@A>> <<consists>> <<Component@B>>');
        expect(token.isSimpleToken()).to.be.false;
        expect(token.isTypeToken()).to.be.false;
        expect(token.isMixedToken()).to.be.true;
    });

    it('Named Tokens with invalid Syntax are not allowed.', () => {
        expect(() => new Token('<<Component@A@B>>')).to.throw(InvalidTokenError);
    });

    it('Types referenced in a Token need to be named uniquely.', () => {
        expect(() => new Token('<<Component>> consists out of <<Component>>')).to.throw(InvalidTokenError);
    });

    it('Names referenced in a Token need to be named uniquely.', () => {
        expect(() => new Token('<<Entity@A>> consists out of <<Component@A>>')).to.throw(InvalidTokenError);
    });

    it('The query Regex of a simple Token is constructed correctly.', () => {
        const token = new Token('consists out of ??');
        
        expect(token.matchRegex).to.deep.equal(new RegExp('consists out of \\?\\?', 'g'));
    });

    it('Named References in a Token are translated correctly into RegEx.', () => {
        const token = new Token('<<Entity@A>> consists out of <<Component@B>>');

        expect(token.matchRegex).to.deep.equal(new RegExp('<<(?<A>Entity)>> consists out of <<(?<B>Component)>>', 'g'));
    });
});