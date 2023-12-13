import { expect } from "chai";
import { Game } from "../src/Game";
import { Player } from "../src/Player";

describe('Uno Tests.', () => {
    let uno: Game;

    const playerA = new Player('Player A');
    const playerB = new Player('Player B');
    const playerC = new Player('Player C');

    const random = <A> (a: Set<A>): A => {
        return [...a][Math.floor(Math.random() * a.size)];
    };

    beforeEach(() => {
        //Game Definition
        uno = new Game([playerA, playerB, playerC]);
        
        uno.registerState('Initial');
        uno.registerState('Play');
        uno.registerState('Gameover');    
        
        //Components
        
        uno.registerComponent('Moveable', {values: {position: undefined}});
        uno.registerComponent('Owned', {values: {owner: undefined}});
        uno.registerComponent('Holder');
        uno.registerComponent('Player', {values: {name: undefined, hand: undefined}}); //LINK TO HAND

        uno.registerComponent('Card', {values: {color: undefined, isSpecial: false}, parents: ['Moveable']});
        uno.registerComponent('ActionCard', {values: {action: undefined, isSpecial: true}, parents: ['Card']});
        uno.registerComponent('NormalCard', {values: {value: undefined, isSpecial: false}, parents: ['Card']});

        uno.registerComponent('Container', {values: {
            cards: ((Card, self) => Card.position == self), 
            topCard: (Card, self) => self.cards.slice(-1) == Card}, parents: ['Holder']});

        uno.registerComponent('Deck', {parents: ['Container']});
        uno.registerComponent('Stack', {parents: ['Container']});

        uno.registerComponent('Hand', {values: {player: undefined, cards: (Card, self) => Card.position == self}, parents: ['Holder', 'Owned']}); //LINK TO PLAYER

        const move: any = uno.registerAction('move', 
            (Moveable, Holder) => `${Moveable} moves to ${Holder}`,
            (Moveable, Holder) => Moveable.position = Holder
        );

        const draw = uno.registerAction('Draw', 
            (Player, Deck) => `${Player} draws ${Deck.topCard} from ${Deck}.`,
            (Player, Deck) => move(Deck.topCard, Player.Hand)
        );

        const play = uno.registerAction('Play', 
            (Player, Card, Stack) => `${Player} plays ${Card} onto ${Stack}.`,
            (Player, Card, Stack) => move(Card, Stack)
        );

        uno.registerGuard(play, (Game, Player) => Game.CurrentPlayer == Player, 'It is not your Turn!'); //Game is always referentiable
        uno.registerGuard(play, (Player, Card) => Card.position == Player.Hand, 'You can only play Cards from your Hand!');
        uno.registerGuard(play, (Player, Card) => !(Player.Hand.Cards.length == 1 && Card.isSpecial), 'You can\'t play special Cards as the last Card!');

        uno.registerAction('Gameover', //automated action?
            'Game is over!',
            (Game) => Game.State = 'Gameover'
        );

        uno.registerGuard('Gameover', (Player) => Player.Hand.cards.length == 0, 'Game is not over yet!'); 
        
        uno.start();
    });

    it('Play-Test #1', () => {
        //Turn #1
        expect(uno.getActions(playerA)).to.have.length(9);
        expect(uno.getActions(playerB)).to.have.length(0);

        uno.do(random(uno.getActions(playerA)), playerA);

        //Turn #2
        expect(uno.getActions(playerA)).to.have.length(0);
        expect(uno.getActions(playerB)).to.have.length(8);
    });
});