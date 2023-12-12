import { expect } from "chai";
import { Game } from "../src/Game";
import { Player } from "../src/Player";

describe('Full integration tests.', () => {
    it('Queries over multiple components return correct Entities.', () => {
        const game = new Game([new Player('Dummy')]);

        game.registerComponent('positionable', {values: {x: 0, y: 0}});
        game.registerComponent('moveable', {values: {speed: 10}, parents: ['positionable']});
        game.registerComponent('living', {values: {age: 1}, parents: ['positionable']});
        game.registerComponent('animal', {parents: ['living', 'moveable']});

        game.registerComponent('herbivore', {values: {food: undefined}, parents: ['animal']});
        game.registerComponent('huggable', {values: {fluffiness: 5}});

        game.spawnEntity(['herbivore', 'huggable'], {values: {food: 'Apple', fluffiness: 10}, name: 'Bunny #1'});
        game.spawnEntity(['herbivore', 'huggable'], {values: {food: 'Banana', fluffiness: 10}, name: 'Bunny #2'});
        game.spawnEntity(['herbivore'], {values: {food: 'Banana'}, name: 'Boar'});

        game.spawnEntity(['animal'], {name: 'Fox'});
        game.spawnEntity(['animal'], {name: 'Bear'});
        game.spawnEntity(['positionable', 'huggable'], {name: 'Tree'});

        expect(game.queryEntities('animal')).to.have.length(5);
        expect(game.queryEntities('herbivore')).to.have.length(3);
        expect(game.queryEntities(['moveable', 'huggable'])).to.have.length(2); //everything that matches all these types (the 2 bunnies)

        expect(game.queryEntities((herbivore, huggable) => herbivore.food == 'Banana' && huggable.fluffiness > 5, true)).to.have.length(1); //"huggable" here only acts as a filter
    });
});