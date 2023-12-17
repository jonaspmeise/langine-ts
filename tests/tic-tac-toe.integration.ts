import { expect } from "chai";
import { Game } from "../src/Game";
import { Player } from "../src/Player";

describe('Tic-Tac-Toe Tests.', () => {
    let tictactoe: Game;

    const playerA = new Player('Player A');
    const playerB = new Player('Player B');

    const random = <A> (a: Set<A>): A => {
        return [...a][Math.floor(Math.random() * a.size)];
    };

    beforeEach(() => {
        //Game Definition
        tictactoe = new Game([playerA, playerB]);  
        
        //Components
        tictactoe.registerComponent('Size', {values: {value: 4}});
        //undefined values must be overwritten when being created
        tictactoe.registerComponent('Player', {values: {name: 'Player ???', playerSymbol: undefined}}) //default values that can be overwritten when generated (or later)
        tictactoe.registerComponent('PlayerSymbol', {values: {symbol: null}});

        tictactoe.registerComponent('Position', {values: {x: 0, y: 0}}); //object = has these attributes
        tictactoe.registerComponent('Tick', {parents: ['Position', 'PlayerSymbol']}); //inherited component
        tictactoe.registerComponent('Field', {values: {Tick: (self, Tick) => Tick.x == self.x && Tick.y == self.y}, parents: ['Position', 'Tick']}); //The Query for the Tick is evaluated automatically
        tictactoe.registerComponent('Lane', {values: {fields: undefined}}); //Lower-Case attribute: can be set anytime or by inheritance
        
        tictactoe.registerComponent('Row', {values: {index: undefined, fields: (self, Field) => Field.position.x == self.index}, parents: ['Lane']}); //Upper-Case parameter: Selector on all these types
        tictactoe.registerComponent('Column', {values: {index: undefined, fields: (self, Field) => Field.position.y == self.index}, parents: ['Lane']}); //Lower-Case parameter: Reference to own attribute
        tictactoe.registerComponent('Diagonal1', {values: {fields: (Field, Size) => (Size-Field.position.x) == Field.position.y}, parents: ['Lane']});
        tictactoe.registerComponent('Diagonal2', {values: {fields: (Field) => Field.position.x == Field.position.y}, parents: ['Lane']});

        //Actions
        tictactoe.registerAction('Place', 
            (Player, Field) => `${Player} place ${Player.playerSymbol} into ${Field}.`,
            (Player, Field) => {Field.playerSymbol = Player.PlayerSymbol;}
        );

        tictactoe.registerGuard('Place', (Game, Player) => Game.CurrentPlayer == Player, 'It is not your Turn!');
        tictactoe.registerGuard('Place', (Field) => Field.Tick == null, 'This field was already used!');

        tictactoe.registerAction('Gameover', //automated action?
            'Game is over!',
            (Game) => Game.State = 'Gameover'
        );

        tictactoe.registerGuard('Gameover', (Game, Lane) => Lane.fields.every((field) => field.Tick.playerSymbol == Game.CurrentPlayer.PlayerSymbol), 'Game is not over yet!'); 

        //add Entities
        tictactoe.spawnEntity(['Size'], {values: {value: 4}});
        
        //add rows & columns
        for(let i = 0; i < tictactoe.findEntityById('Size')[0].value; i++) {
            tictactoe.spawnEntity(['Row'], {values: {index: i}});
            tictactoe.spawnEntity(['Row'], {values: {position: i}});
        }
        tictactoe.spawnEntity(['Diagonal1']);
        tictactoe.spawnEntity(['Diagonal2']);

        tictactoe.step();
    });

    it('Play-Test #1', () => {
        //Turn #1
        expect(tictactoe.getActions(playerA)).to.have.length(9);
        expect(tictactoe.getActions(playerB)).to.have.length(0);
    });
});