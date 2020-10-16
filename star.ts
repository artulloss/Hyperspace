import { Sprite, Texture } from "pixi.js"
export default class Star {

    private sprite: Sprite = new Sprite(Texture.from('img/star.png'));

    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getSprite(): Sprite {
        return this.sprite;
    }

    getTexture(): Texture {
        return this.sprite.texture;
    }

}