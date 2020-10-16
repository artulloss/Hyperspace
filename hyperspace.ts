import { Application, InteractionEvent } from 'pixi.js'
import { debounce } from 'ts-debounce';
import Star from "./star"
import config from './config.json';

class Pixi {

    private app: Application = new Application(); // You have to definitively assign the application :P
    private stars: Star[] = [];
    private starAmount: number = 0;
    private cameraZ: number = 0;
    private speed: number = 0;
    private warpSpeed: number = 0;

    constructor() {
        this.startHyperSpace();
        this.app.ticker.add(this.runningLoop);
    }

    startHyperSpace() {
        this.stars = [];
        this.app = new Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x111
        });
        document.body.appendChild(this.app.view);
        const area = window.innerWidth * window.innerHeight;
        if(config.starAmount === "auto") {
            this.starAmount = area / 1000;
        } else {
            this.starAmount = Number(config.starAmount);
        }

        this.addEventListeners();
        this.generateStars();
    }

    addEventListeners(): void {
        window.addEventListener("resize", debounce(() => { // Wait until we are finished resizing
            e.height
            let element = document.getElementsByTagName("canvas"), index;
            for (index = element.length - 1; index >= 0; index--) { // Delete all canvases (should only be 1)
                element[index].parentNode?.removeChild(element[index]);
            }
            this.startHyperSpace();
        }, 500));
        this.app.renderer.plugins.interaction.on('pointerdown', (e: InteractionEvent) => {
            this.warpSpeed = 1;
        });
        this.app.renderer.plugins.interaction.on('pointerup', (e: InteractionEvent) => {
            this.warpSpeed = 0;
        });
    }

    generateStars(): void {
        for (let i = 0; i < this.starAmount; i++) {
            const star = new Star(0, 0, 0);
            const sprite = star.getSprite();
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.7;
            this.randomizeStar(star, true);
            this.app.stage.addChild(sprite);
            this.stars.push(star);
        }
    }

    randomizeStar(star: Star, initial: boolean = false): void {
        star.z = initial ? Math.random() * 2000 : this.cameraZ + Math.random() * 1000 + 2000;
    
        // Calculate star positions with radial random coordinate so no star hits the camera.
        const deg = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 1;
        star.x = Math.cos(deg) * distance;
        star.y = Math.sin(deg) * distance;
    }

    runningLoop = (delta: number) => {
        // Simple easing. This should be changed to proper easing function when used for real.
        this.speed += (this.warpSpeed - this.speed) / 20;
        this.cameraZ += delta * 10 * (this.speed + config.baseSpeed);
        for (let i = 0; i < this.starAmount; i++) {
            const star: Star = this.stars[i];
            if (star.z < this.cameraZ) this.randomizeStar(star);

            // Map star 3d position to 2d with really simple projection
            const z = star.z - this.cameraZ;
            star.getSprite().x = star.x * (config.fov / z) * this.app.renderer.screen.width + this.app.renderer.screen.width / 2;
            star.getSprite().y = star.y * (config.fov / z) * this.app.renderer.screen.width + this.app.renderer.screen.height / 2;

            // Calculate star scale & rotation.
            const dxCenter = star.getSprite().x - this.app.renderer.screen.width / 2;
            const dyCenter = star.getSprite().y - this.app.renderer.screen.height / 2;
            const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
            const distanceScale = Math.max(0, (2000 - z) / 2000);
            star.getSprite().scale.x = distanceScale * config.starBaseSize;
            // Star is looking towards center so that y axis is towards center.
            // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
            star.getSprite().scale.y = distanceScale * config.starBaseSize + distanceScale * this.speed * config.starStretch * distanceCenter / this.app.renderer.screen.width;
            star.getSprite().rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
        }
    }
    
}

// Create the class when the windows loads
window.onload = function(this: GlobalEventHandlers, ev: Event) {
    new Pixi();
}