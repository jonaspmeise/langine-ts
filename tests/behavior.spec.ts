import { expect } from "chai";
import { Game } from "../src/Game";
import { Player } from "../src/Player";
import { InvalidComponentException } from "../src/InvalidComponentException";
import { NonExistingException } from "../src/NonExistingException";
import { MissingSetupException } from "../src/MissingSetupException";
import { Component } from "../src/Component";
import { InvalidEntityException } from "../src/InvalidEntityException";

describe('Behavior tests.', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game([new Player('Dummy')]);
    });

    describe('Registering Components.', () => {
        it('Registering a Component with an already existing ID throws an Error.', () => {
            game.registerComponent('test');

            expect(() => game.registerComponent('test')).to.throw(InvalidComponentException);
        });

        it('Registering a Component returns the Component itself.', () => {
            const component = game.registerComponent('test', {values: {x: 1, y: 1}});

            expect(component).to.deep.equal({x: 1, y: 1});
        });

        it('Registering a Component with a Parent (by reference) works.', () => {
            game.registerComponent('test', {values: {x: 1, y: 1}});
            game.registerComponent('test-child', {values: {z: 1}, parents: ['test']});

            expect(game.findComponentById('test-child')).to.deep.equal({x: 1, y: 1, z: 1});
        });

        it('Registering a Component with a Parent (by object) works.', () => {
            const parentComponent = game.registerComponent('test', {values: {x: 1, y: 1}});
            const childComponent = game.registerComponent('test-child', {values: {z: 1}, parents: [parentComponent]});

            expect(childComponent).to.deep.equal({x: 1, y: 1, z: 1});
        });

        it('Registering a Component with a non-existing Parent (by reference) throws an Error.', () => {
            expect(() => game.registerComponent('test-child', {values: {z: 1}, parents: ['non-existing parent']})).to.throw(MissingSetupException);
        });

        it('Registering a Component with a non-existing Parent (by object) throws an Error.', () => {
            const fakeComponent = new Component();

            expect(() => game.registerComponent('test-child', {values: {z: 1}, parents: [fakeComponent]})).to.throw(InvalidComponentException);
        });

        it('A child\'s values take precedence over the inherited values from its parent.', () => {
            game.registerComponent('parent', {values: {x: 1, y: 1}});
            game.registerComponent('child', {values: {x: 5, z: 1}, parents: ['parent']});

            expect(game.findComponentById('child')).to.deep.equal({x: 5, y: 1, z: 1});
        });
    });

    describe('Finding Components.', () => {
        it('Searching for a non-existing Component throws an Error.', () => {
            expect(() => game.findComponentById('something')).to.throw(NonExistingException);
        });

        it('Registering an Component allows it to be found afterwards.', () => {
            game.registerComponent('test', {values: {x: 1, y: 1}});

            expect(game.findComponentById('test')).to.deep.equal({x: 1, y: 1});
        });
    });

    describe('Spawning Entities.', () => {
        it('Spawning an Entity with an already existing Name throws an Error.', () => {
            game.registerComponent('something');

            game.spawnEntity(['something'], {name: 'Object A'});
            expect(() => game.spawnEntity(['something'], {name: 'Object A'})).to.throw(InvalidEntityException);
        });

        it('Spawning an Entity with no Components throws an Error.', () => {
            expect(() => game.spawnEntity([])).to.throw(InvalidEntityException);
        });

        it('Spawning an Entity with an invalid Component (by reference) throws an Error.', () => {
            expect(() => game.spawnEntity(['something'])).to.throw(MissingSetupException);
        });

        it('Spawning an Entity with an invalid Component (by object) throws an Error.', () => {
            expect(() => game.spawnEntity([new Component()])).to.throw(InvalidEntityException);
        });

        it('Spawning an Entity without passing required values of an Object throws an Error.', () => {
            game.registerComponent('secret', {values: {secret: undefined}});

            expect(() => game.spawnEntity(['secret'])).to.throw(MissingSetupException);
        });

        it('Spawning an Entity with multiple Components merges all their initial values.', () => {
            game.registerComponent('protected', {values: {secret: '123abc'}});
            game.registerComponent('nameable', {values: {name: 'John'}});

            expect(game.spawnEntity(['protected', 'nameable'])).to.deep.equal({name: 'John', secret: '123abc'});
        });

        it('Spawning an Entity with multiple Components merges all their values, including Parents.', () => {
            game.registerComponent('hashable', {values: {hashable: undefined}});
            game.registerComponent('protected', {values: {secret: '123abc', hashable: true}, parents: ['hashable']});
            game.registerComponent('nameable', {values: {name: 'John'}});
            game.registerComponent('user', {parents: ['protected', 'nameable']});

            expect(game.spawnEntity(['user'])).to.deep.equal({name: 'John', secret: '123abc', hashable: true});
        });

        it('Spawning an Entity with initial values overwrites default values from its Components.', () => {
            game.registerComponent('nameable', {values: {name: 'John'}});

            expect(game.spawnEntity(['nameable'], {values: {name: 'Alex'}})).to.deep.equal({name: 'Alex'});
        });

        it('Spawning an Entity with initial values, that are not indicated by a Component, throws an Error.', () => {
            game.registerComponent('nameable', {values: {name: 'John'}});

            expect(() => game.spawnEntity(['nameable'], {values: {age: 120}})).to.throw(InvalidEntityException);
        });
    });
});