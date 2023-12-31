import { expect } from "chai";
import { Game } from "../../src/ECS/Game";
import { Player } from "../../src/ECS/Player";
import { InvalidComponentException } from "../../src/Exceptions/InvalidComponentException";
import { NonExistingException } from "../../src/Exceptions/NonExistingException";
import { MissingSetupException } from "../../src/Exceptions/MissingSetupException";
import { Component } from "../../src/ECS/Component";
import { InvalidEntityException } from "../../src/Exceptions/InvalidEntityException";
import { InvalidActionException } from "../../src/Exceptions/InvalidActionException";
import { Entity } from "../../src/ECS/Entity";
import { InvalidGuardException } from "../../src/Exceptions/InvalidGuardException";
import { ActionFunction } from "../../src/ECS/Types";

describe('Behavior tests.', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game([new Player('Dummy A'), new Player('Dummy B')]);
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

        it('Registering a Component that matches a predefined Component (Player, Game) throws an Error.', () => {
            expect(() => game.registerComponent('Player')).to.throw(InvalidComponentException);
            expect(() => game.registerComponent('Game')).to.throw(InvalidComponentException);
        });

        it('A new Component can inherit predefined Component Types to increase their functionality.', () => {
            const aiPlayer = game.registerComponent('AiPlayer', {parents: ['Player'], values: {script: 'script.txt'}});
            game.registerComponent('DummyGame', {parents: ['Game'], values: {turnCount: 0}});

            expect(aiPlayer).to.deep.equal({script: 'script.txt', player: undefined});
        });

        it('Player and Game-Entiites are automatically created in the first Step.', () => {
            game.step();

            expect(game.queryEntities('Player')).to.have.length(2);
            expect(game.queryEntities('Game')).to.have.length(1);

            expect([...game.queryEntities('Player')][0].player).to.be.not.undefined;
        });

        it('If Custom Components of Type "Player" or "Game" are defined, these are created instead.', () => {
            const aiPlayer = game.registerComponent('AiPlayer', {parents: ['Player'], values: {script: 'script.txt'}});
            const dummyGame = game.registerComponent('DummyGame', {parents: ['Game'], values: {turnCount: 0}});

            game.step();

            expect(game.queryEntities(aiPlayer)).to.have.length(2);
            expect(game.queryEntities(dummyGame)).to.have.length(1);

            expect([...game.queryEntities(aiPlayer)][0].script).to.equal('script.txt');
        });

        //Game & Player-Entities automatically register themselves based on the context if the user didn't do so yet.
        //Game & Player-Entities don't automtically register themselves if the Player already defined them.

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
            expect(() => game.registerComponent('test-child', {values: {z: 1}, parents: ['non-existing parent']})).to.throw(NonExistingException);
        });

        it('Registering a Component with a non-existing Parent (by object) throws an Error.', () => {
            const fakeComponent = new Component();

            expect(() => game.registerComponent('test-child', {values: {z: 1}, parents: [fakeComponent]})).to.throw(MissingSetupException);
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

    describe('Querying Entities.', () => {
        beforeEach(() => {
            game.registerComponent('moveable', {values: {speed: 10}});
            game.registerComponent('placeable', {values: {x: 0, y: 0}});
            game.registerComponent('colorable', {values: {color: 'red'}});

            game.spawnEntity(['colorable', 'placeable'], {name: 'a red traffic postbox', values: {x: 5}});
            game.spawnEntity(['placeable', 'moveable'], {name: 'a cloud', values: {speed: 3, y: 100}});
            game.spawnEntity(['colorable', 'moveable', 'placeable'], {name: 'a rocket', values: {y: 50, speed: 100, color: 'yellow'}});
            game.spawnEntity(['colorable'], {name: 'the evening light', values: {color: 'yellow'}});
        });

        it('Automatically generated Game/Player-Entities can be acessed after the initial Step.', () => {
            expect(game.queryEntities('Player')).to.have.length(0);
            expect(game.queryEntities('Game')).to.have.length(0);

            game.step();

            expect(game.queryEntities('Player')).to.have.length(2);
            expect(game.queryEntities('Game')).to.have.length(1);
        });
        
        it('Querying with many identical filters is the same as a single filter.', () => {
            expect(game.queryEntities(['colorable', 'colorable', 'colorable', 'colorable']).size).to.equal(game.queryEntities('colorable').size);
        });

        it('Finds Entities that are of the single Component in a given Query.', () => {
            expect(game.queryEntities('colorable')).to.have.length(3);
            expect(game.queryEntities('placeable')).to.have.length(3);
            expect(game.queryEntities('moveable')).to.have.length(2);
            expect(game.queryEntities()).to.have.length(4); //shortcut for: all components + Player
        });

        it('Finds Entities that have all the Components in a given Query.', () => {
            expect(game.queryEntities(['colorable', 'placeable'])).to.have.length(2);
            expect(game.queryEntities(['placeable', 'moveable'])).to.have.length(2);
            expect(game.queryEntities(['moveable', 'colorable'])).to.have.length(1);
        });

        it('Querying using a Filter-Function returns a Set of Entities, which have the given Components of the Filter and fulfil the Filter.', () => {
            expect(game.queryEntities((moveable) => moveable.speed > 10)).to.deep.include({speed: 100, color: 'yellow', x: 0, y: 50}); //our rocket!
            expect(game.queryEntities((colorable) => colorable.color == 'yellow')).to.have.length(2); //cloud + rocket
            expect(game.queryEntities((colorable, moveable) => colorable.color != 'red')).to.deep.include({speed: 100, color: 'yellow', x: 0, y: 50}); //only the rocket, since the evening light is not "moveable"
        });

        it('Querying using a Filter-Function over a combination returns a Set of Arrays of Entities, which in Combination fulill the Function.', () => {
            expect(game.queryEntities((moveable, colorable) => moveable.speed > 0 && colorable.color == 'yellow', true)).to.have.length(2 * 2);
            //equal to the following set:
            //"a cloud" x "a rocket"
            //"a cloud" x "the evening light"        
            //"a rocket" x "a rocket"
            //"a rocket" x "the evening light"
        });

        it('Querying over a combination returns Set of Lists of Entity-Arrays, which are of these values each.', () => {
            const entityCombinations = game.queryEntities(['moveable', 'colorable'], true);
            expect(entityCombinations).to.have.length(2 * 3);
            
            entityCombinations.forEach(([moveableThing, colorableThing]) => {
                expect(!!moveableThing.speed).to.be.true;
                expect(!!colorableThing.color).to.be.true;
            });
        });
    });

    describe('Modifying Entities.', () => {
        it('Modifying the Entity (result) of a Filter also modifies the true object.', () => {
            game.registerComponent('nameable', {values: {name: undefined}});
            game.spawnEntity(['nameable'], {values: {name: 'Peter'}});
            game.spawnEntity(['nameable'], {values: {name: 'Jack'}});

            const entities = game.queryEntities('nameable');

            expect(entities).to.have.length(2);
            entities.forEach((entity) => entity.name += ' Jackson');

            expect(game.queryEntities('nameable')).to.deep.include({name: 'Peter Jackson'});
            expect(game.queryEntities('nameable')).to.deep.include({name: 'Jack Jackson'});
        });

        it('Modifying a Entity\'s Components changes its values (and all variables that are a reference to that value), too.', () => {
            game.registerComponent('nameable', {values: {name: undefined}});
            game.registerComponent('ageable', {values: {age: 10}});

            game.spawnEntity(['nameable'], {values: {name: 'Peter'}});
            const entity = [...game.queryEntities('nameable')][0];

            game.addComponentToEntity(entity, 'ageable');

            expect(entity.name).to.equal('Peter');
            expect(entity.age).to.equal(10);
        });

        it('Adding a Component to an Entity without providing required values of that Component throws an Error.', () => {
            game.registerComponent('nameable', {values: {name: undefined}});
            game.registerComponent('ageable', {values: {age: 10}});

            const entity = game.spawnEntity(['ageable']);

            expect(() => game.addComponentToEntity(entity, 'nameable')).to.throw(MissingSetupException);
        });

        it('Adding a non-existing "Component" to an Entity throws an Error.', () => {
            game.registerComponent('ageable', {values: {age: 10}});

            game.spawnEntity(['ageable']);
            const entity = [...game.queryEntities('ageable')][0];

            expect(() => game.addComponentToEntity(entity, 'non-existing component')).to.throw(InvalidComponentException);
        });

        it('Adding a Component to a non-existing Entity throws an Error.', () => {
            game.registerComponent('ageable', {values: {age: 10}});

            game.spawnEntity(['ageable']);

            expect(() => game.addComponentToEntity('non-existing-entity-id', 'ageable')).to.throw(InvalidEntityException);
        });

        it('Modifying an spawned Entity modifies it inside the Engine, too.', () => {
            game.registerComponent('ageable', {values: {age: 10}});

            const entity = game.spawnEntity(['ageable']);
            entity.age = 100;

            expect(game.queryEntities((ageable) => ageable.age == 100)).to.have.length(1);
            expect(game.queryEntities((ageable) => ageable.age != 100)).to.have.length(0);
        })

        //Removing Components from Entities
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
            expect(() => game.spawnEntity(['something'])).to.throw(NonExistingException);
        });

        it('Spawning an Entity with an invalid Component (by object) throws an Error.', () => {
            expect(() => game.spawnEntity([new Component()])).to.throw(MissingSetupException);
        });

        it('Spawning an Entity without passing required values of an Component throws an Error.', () => {
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

    describe('Actions & Guards.', () => {
        const playerA = new Player('Player A');
        const playerB = new Player('Player B');

        let increase: ActionFunction;
        let shuffle: ActionFunction;
        let redDice: Entity;
        let blueDice: Entity;

        beforeEach(() => {
            game = new Game([playerA, playerB]);
            game.registerComponent('Dice', {values: {value: 1}});

            shuffle = game.registerAction('shuffle', 
                (Dice) => `${Dice} has been shuffled.`,
                (Dice) => Dice.value = Math.floor(Math.random()*6)+1
            );

            increase = game.registerAction('increase', 
                (Player, Dice) => `${Player} increased the ${Dice}`,
                (Player, Dice) => Dice.value += 1);

            redDice = game.spawnEntity(['Dice'], {name: 'Red Dice'});
            blueDice = game.spawnEntity(['Dice'], {name: 'Blue Dice'});

            //FIXME: This line exists only so that the TS-Compiler recognizes these variables as being used
            console.log(blueDice, redDice, shuffle, increase);
        });

        it('An Action can be registered and is doable by any Player.', () => {
            game.registerAction('increase-big', 
                (Player, Dice) => `${Player} increases the ${Dice} big`,
                (Player, Dice) => Dice.value += 2);

            game.step();
            
            expect(game.getActions(playerA)).to.have.length(4); //2 "Player-Actions" + 2 Dice
            expect(game.getActions(playerB)).to.have.length(4); //2 "Player-Actions" + 2 Dice

            //TODO: De-couple Player-Actions from normal Actions:
            //Players may trigger actions, but actions may also trigger other actions without any input
            //The fact that a Player "can" do something should depend on the Player and not the Action
            //(other domain) --> Allowed Actions (of Player) vs. Action Definitions (of Actions)
        });

        it('An Action can\'t be registered if it already exists.', () => {
            expect(() => game.registerAction('increase', 
                (Player, Dice) => `${Player} increased the ${Dice}`,
                (Player, Dice) => Dice.value += 1))
            .to.throw(InvalidActionException);
        });

        it('An Action can\'t be registered if the Event Function takes no Components as parameters.', () => {
            expect(() => game.registerAction('something', 'something', () => true)).to.throw(InvalidActionException);
        });

        it('The Components for the Language must be a subset of the Components for the Effect.', () => {
            expect(() => game.registerAction('increase', 
                (Player, Dice) => `${Player} increased the ${Dice}`,
                (Dice) => Dice.value += 1)).to.throw(InvalidActionException);
        });

        it('The refered Components in both the Language and the Effect must exist.', () => {
            expect(() => game.registerAction('increase', 
                (Something) => `${Something} happened!`,
                (Something) => true)).to.throw(InvalidActionException);
        });

        it('Actions that involve Players are special; They are returned when Queried for Actions of a Player.', () => {
            game.registerAction('reset',
                (Dice) => `${Dice} has been reset!`,
                (Dice) => Dice.value = 1);
            
            game.step();

            expect(game.getActions(playerA)).to.have.length(2); //2 Dice
            expect(game.getActions(playerB)).to.have.length(2); //2 Dice
            expect(game.getActions()).to.have.length(2 * 2 + 2 + 2); //Increase: 2 Players * 2 Dice, Shuffle: 2 Dice, Rest: 2 Dice = 8
        });

        it('Actions can be called from other Actions or externally, too. That\'s why it\'s smart to save the Actions in a local variable.', () => {
            const doubleIncrease = game.registerAction('double-increase', 
                (Player, Dice) => `${Player} double-increased ${Dice} by 2`,
                (Player, Dice) => {increase(Player, Dice); increase(Player, Dice);});

            doubleIncrease(playerA, redDice);
            game.step();
            expect(redDice.value).to.equal(3);
        });

        it('Guards must reference an existing Action.', () => {
            expect(() => game.registerGuard('something-that-does-not-exist', () => true)).to.throw(InvalidGuardException);
        });

        it('The Message Function of a Guard needs to be a subset of the Components referenced in the Check Function.', () => {
            expect(() => game.registerGuard('increase', (Dice) => true, (Player, Dice) => 'xd')).to.throw(InvalidGuardException);       
        });

        it('The Check Function (and thus the Message Function) need to reference Components that are a Subset of the Components of the referenced Action.', () => {
            expect(() => game.registerGuard('increase', (Game) => true)).to.throw(InvalidGuardException);
            expect(() => game.registerGuard('increase', (Dice) => true, (Dice1, Dice2) => 'xd')).to.throw(InvalidGuardException);     
        });
    });
});