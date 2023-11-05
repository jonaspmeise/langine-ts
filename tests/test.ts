import { expect } from "chai";
import { Langine } from "../src/langine";
import { EntityBlueprint } from "../src/entity-blueprint";

describe('Langine.', () => {
    let langine: Langine;

    beforeEach(() => {
        langine = new Langine();
    })

    it('Can be instantiated.', () => {
        expect(langine).to.be.not.null;
    });

    it('Components can be registered.', () => {
        langine.registerComponent('position', {x: 0, y: 0, z: 0});

        expect(langine.getComponent('position')).to.deep.equal({x: 0, y: 0, z: 0});
    });

    describe('Entities.', () => {
        it('Entity Blueprints can be registered and created using Component values.', () => {
            langine.registerComponent('position', {x: 0, y: 0, z: 0});
            const bunnyEntityBlueprint: EntityBlueprint = langine.registerEntityBlueprint('bunny', {x: 1, y: 2, z: 3});

            expect(bunnyEntityBlueprint.getTags().has('bunny')).to.be.true;
            expect(bunnyEntityBlueprint.getValue('x')).to.equal(1);
        });

        it('Entity Blueprints can be registered and created using Component Tags.', () => {
            langine.registerComponent('position', {x: 0, y: 0, z: 0});
            langine.registerEntityBlueprint('bunny', {}, 'position');
            langine.createEntity('bunny');

            expect(langine.getWorld().length).to.equal(1);
        });

        it('You can not create an Entity Blueprint from a non-existing Component.', () => {
            expect(() => {langine.registerEntityBlueprint('bunny', {}, 'position');}).to.throw('The Component "position" is undefined. Please register it first!');
        });
    })
});

