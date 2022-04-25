namespace Script {

    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;

    export class MrFudge {

        private grid: ƒ.Node;
        private translator: ƒ.Node;
        private rotator: ƒ.Node;

        private speed: number = 1 / 20;
        private velocity: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
        private threshold: number = 0.1;
        private sprite: ƒAid.NodeSprite
        private spriteReverse: boolean = false;
        private wakka: ƒ.ComponentAudio;

        private score: number = 0;
        private running: boolean = true;


        constructor(_graph: ƒ.Node, _animations: ƒAid.SpriteSheetAnimations, _wakka: ƒ.ComponentAudio) {
            this.grid = _graph.getChildrenByName("Grid")[0];
            this.translator = _graph.getChildrenByName("MrFudge")[0];
            this.rotator = this.translator.getChildrenByName("rotation")[0];
            this.createSprite(_animations);
            this.wakka = _wakka;
        }

        public update(_key: ƒ.KEYBOARD_CODE): ƒ.KEYBOARD_CODE {
            let tempKey: ƒ.KEYBOARD_CODE = _key;
            if (this.running) {
                tempKey = this.updateTurn(_key);
                this.updateSprite();
                this.updateSound();
                this.move();
            }
            return tempKey;
        }

        public getPos(): ƒ.Vector2 {
            return new ƒ.Vector2(this.translator.mtxLocal.translation.x, this.translator.mtxLocal.translation.y);
        }
        public getDir(): ƒ.Vector2 {
            return new ƒ.Vector2(Math.round(this.velocity.x / this.speed), Math.round(this.velocity.y / this.speed));
        }

        private move(): void {
            let tempPos: ƒ.Vector3 = this.translator.mtxLocal.translation;
            let t: number = this.threshold;
            if ((tempPos.y % 1) + t / 2 < t && (tempPos.x % 1) + t / 2 < t) { //schaut ob sich Mr.Fudge auf einem Knotenpunkt befindet
                let fudgeTilePos: ƒ.Vector2 = new ƒ.Vector2(Math.round(tempPos.x), Math.round(tempPos.y));
                if (!this.isEaten(fudgeTilePos)) {
                    this.eat(fudgeTilePos);
                }
                if (this.isPath(Math.round(this.velocity.x / this.speed), Math.round(this.velocity.y / this.speed))) {                                                       //schaut ob das kommende Tile eine Wand ist
                    this.translator.mtxLocal.translate(this.velocity);
                } else {
                    tempPos = new ƒ.Vector3(Math.round(tempPos.x), Math.round(tempPos.y), 0);                               //setzt Mr. Fudge auf die Mitte des Tiles
                    this.velocity.set(0, 0, 0);
                }
            } else {
                this.translator.mtxLocal.translate(this.velocity);
            }
        }

        public stop(): void {
            this.running = false;
        }

        private updateTurn(_key: ƒ.KEYBOARD_CODE): ƒ.KEYBOARD_CODE { // Methode funktioniert nicht all zu gut im negativen Bereich... vielleicht mal danach schauen
            let tempKey: ƒ.KEYBOARD_CODE = _key
            switch (tempKey) {
                case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                    tempKey = this.turnIfPossible(_key, 1, 0);
                    if (tempKey == ƒ.KEYBOARD_CODE.ESC) {
                        this.rotator.mtxLocal.rotation = new ƒ.Vector3(0, 0, 0);
                    }
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                    tempKey = this.turnIfPossible(_key, -1, 0);
                    if (tempKey == ƒ.KEYBOARD_CODE.ESC) {
                        this.rotator.mtxLocal.rotation = new ƒ.Vector3(0, 180, 0);
                    }
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    tempKey = this.turnIfPossible(_key, 0, 1);
                    if (tempKey == ƒ.KEYBOARD_CODE.ESC) {
                        this.rotator.mtxLocal.rotation = new ƒ.Vector3(0, 0, 90);
                    }
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    tempKey = this.turnIfPossible(_key, 0, -1);
                    if (tempKey == ƒ.KEYBOARD_CODE.ESC) {
                        this.rotator.mtxLocal.rotation = new ƒ.Vector3(0, 0, -90);
                    }
                    break;
                case ƒ.KEYBOARD_CODE.ESC:
                    break;
                default:
                    console.log("bei der Translationszuweisung geschehen seltsame Dinge");
            }
            return tempKey;
        }

        private turnIfPossible(_tempKey: ƒ.KEYBOARD_CODE, _x: number, _y: number): ƒ.KEYBOARD_CODE {
            let tempPos: ƒ.Vector3 = this.translator.mtxLocal.translation;
            let t: number = this.threshold;
            if (((tempPos.x % 1) + t / 2 < t && Math.abs(_y) > 0) || ((tempPos.y % 1) + t / 2 < t && Math.abs(_x) > 0)) {
                if (this.isPath(_x, _y)) {
                    if (Math.abs(_x)) {
                        tempPos = new ƒ.Vector3(tempPos.x, Math.round(tempPos.y), 0);
                    } else {
                        tempPos = new ƒ.Vector3(Math.round(tempPos.x), tempPos.y, 0);
                    }
                    this.velocity.set(this.speed * _x, this.speed * _y, 0);
                    this.rotator.mtxLocal.reset();
                    _tempKey = ƒ.KEYBOARD_CODE.ESC;
                }
            }
            return _tempKey
        }

        private eat(_pos: ƒ.Vector2): void {
            let tempTile: ƒ.Node = this.grid.getChildren()[_pos.y].getChildren()[_pos.x];
            let tempMat: ƒ.ComponentMaterial = <ƒ.ComponentMaterial>tempTile.getAllComponents()[0];
            tempMat.clrPrimary.setHex("000000");
            this.score++;
            console.log(this.score);
        }

        private updateSprite(): void {
            if (this.sprite.getCurrentFrame == 7 && !this.spriteReverse) {
                this.sprite.setFrameDirection(-1);
                this.spriteReverse = true;
            } else if (this.sprite.getCurrentFrame == 0 && this.spriteReverse) {
                this.sprite.setFrameDirection(1);
                this.spriteReverse = false;
            }
        }

        private updateSound(): void {
            if (this.velocity.x == 0 && this.velocity.y == 0) {
                this.wakka.volume = 0;
            } else {
                this.wakka.volume = 0.3;
            }
        }

        private isPath(_dirX: number, _dirY: number): boolean {
            let nextX: number = Math.round(this.translator.mtxLocal.translation.x) + _dirX;
            let nextY: number = Math.round(this.translator.mtxLocal.translation.y) + _dirY;
            let tempTile: ƒ.Node = this.grid.getChildren()[nextY].getChildren()[nextX];
            let tempMat: ƒ.ComponentMaterial = <ƒ.ComponentMaterial>tempTile.getAllComponents()[0];
            if (tempMat.clrPrimary.b == 0) {
                return true;
            }
            return false;
        }

        private isEaten(_pos: ƒ.Vector2): boolean {
            let tempTile: ƒ.Node = this.grid.getChildren()[_pos.y].getChildren()[_pos.x];
            let tempMat: ƒ.ComponentMaterial = <ƒ.ComponentMaterial>tempTile.getAllComponents()[0];
            if (tempMat.clrPrimary.g == 0) {
                return true;
            }
            return false;
        }

        private createSprite(_animations: ƒAid.SpriteSheetAnimations): void {
            this.sprite = new ƒAid.NodeSprite("Sprite");
            this.sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            this.sprite.setAnimation(<ƒAid.SpriteSheetAnimation>_animations["mrFudge"]);
            this.sprite.setFrameDirection(1);

            this.sprite.mtxLocal.translateZ(0.1);
            this.sprite.framerate = 60;

            this.rotator.addChild(this.sprite);
            this.rotator.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        }
    }
}