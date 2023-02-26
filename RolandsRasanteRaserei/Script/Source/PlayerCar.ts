namespace Raserei {
    import ƒ = FudgeCore;

    export class PlayerCar extends Car {

        // Runtime Values 
        private score: number = 0;
        private camPosArray: ƒ.Vector3[] = [];
        private engineSound: any = new Audio("audio/2cv.mp3");
        private coinSound: HTMLAudioElement = new Audio("audio/coin.wav");
        private canSound: HTMLAudioElement = new Audio("audio/can.wav");

        constructor(_config: Config, _car: ƒ.Node, _world: World) {
            super();
            this.config = _config;
            this.world = _world;
            this.world.setPlayerCar(this);

            this.carNode = _car;
            this.main = _car.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];

            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.carNode.addComponent(this.sphericalJoint);
            this.mainRB.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);

            this.engineSoundComponent = <ƒ.ComponentAudio>this.main.getChildrenByName("Audio")[0].getAllComponents()[0];
            this.setupEngineSound();

            this.pos = ƒ.Vector3.SCALE(this.mainRB.getPosition(), 1);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
            this.coinSound.volume = 0.2;
            this.canSound.volume = 0.8;
        }

        public update(_playing: boolean): void {
            if (_playing) {
                this.updateTurning(this.updateDriving(ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])), ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
                this.pinToGround();
                this.updateCamPosArray();
                this.updatePos();
            }
            this.updateEngineSound(_playing);
        }

        public incScore(): void {
            this.coinSound.currentTime = 0;
            this.coinSound.play();
            this.score++;
        }

        public payForGas(): void {
            this.score -= this.config.gasprice;
        }

        public fillTank(): void {
            this.canSound.currentTime = 0;
            this.canSound.play();
            this.gaz = 100;
        }

        public getCamPos(): ƒ.Vector3 {
            return this.camPosArray[0];
        }

        public getGazPercent(): number {
            return this.gaz;
        }

        public isOutOfFuel(): boolean {
            if (this.gaz == 0 && this.getSpeedPercent() < 0.01) {
                return true;
            }
            return false;
        }

        public getScore(): number {
            return this.score;
        }

        public getPosition(): ƒ.Vector3 {
            return ƒ.Vector3.SCALE(this.mainRB.getPosition(), 1);
        }

        public getRotation(): ƒ.Vector3 {
            return ƒ.Vector3.SCALE(this.main.mtxLocal.getEulerAngles(), 1);
        }

        private hndCollision = (_event: ƒ.EventPhysics): void => {
            let graph: ƒ.GraphInstance = <ƒ.GraphInstance>_event.cmpRigidbody.node;
            if (graph.idSource == World.coinGraphID || graph.idSource == World.canGraphID) {
                this.world.addToDoomedCollectables(graph);
            }
        }

        protected updateGaz(_factor: number): void {
            this.gaz = Math.max(0, this.gaz - this.config.fuelConsumption * Math.abs(_factor));
        }

        private setupEngineSound(): void {
            this.engineSound.play();
            this.engineSound.volume = 0.1;
            this.engineSound.loop = true;
            if ("preservesPitch" in this.engineSound) {
                this.engineSound.preservesPitch = false;
            } else if ("mozPreservesPitch" in this.engineSound) {
                this.engineSound.mozPreservesPitch = false;
            }
        }

        private updateCamPosArray(): void {
            let tempPos: ƒ.Vector3 = this.main.mtxLocal.getEulerAngles();
            let newPos: ƒ.Vector3 = new ƒ.Vector3(tempPos.x, tempPos.y, tempPos.z);

            this.camPosArray.push(newPos);
            if (this.camPosArray.length > this.config.camDelay) {
                this.camPosArray.splice(0, 1);
            }
        }

        private updateEngineSound(_playing: boolean) {
            if (_playing) {
                this.engineSound.playbackRate = 1 + this.getSpeedPercent();
                this.engineSound.volume = Math.min(0.1 + (this.getSpeedPercent() * 0.9, 0.9) * 0.2);
            } else {
                this.engineSound.volume = Math.max(this.engineSound.volume - 0.01, 0);
            }
        }
    }
}