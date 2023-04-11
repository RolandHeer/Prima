namespace Raserei {
    import ƒ = FudgeCore;
    export class PoliceCar extends Car {

        private player: PlayerCar;
        private distPlayer: number;                 //Distance to Player Car in Meter
        private countdown: number;
        private counting: boolean = false;
        private sirenSoundComponent: ƒ.ComponentAudio;
        public gottchaEvent: CustomEvent = new CustomEvent("gottcha", {
            detail: {
                message: "I got him lads!"
            }
        });

        constructor(_config: Config, _carNode: ƒ.Node, _player: PlayerCar) {
            super(_carNode);
            this.config = _config;
            this.player = _player;
            this.isPolice = true;

            this.setupPoliceCar(_config, _carNode);
        }

        public update(_playing: boolean): void {
            this.distPlayer = this.mainRB.getPosition().getDistance(this.player.getPosition());
            let dir: ƒ.Vector2 = this.getDir();
            console.log("x: " + Math.round(dir.x * 30) + ", y: " + Math.round(dir.y * 30));
            this.updateTurning(this.updateDriving(dir.y), dir.x);
            this.pinToGround();
            this.updatePos();
            this.updateCountdown();
            if (!_playing) {
                this.engineSoundComponent.volume = Math.max(this.engineSoundComponent.volume - 0.01, 0);
                this.sirenSoundComponent.volume = Math.max(this.sirenSoundComponent.volume - 0.01, 0);
            }
        }

        public hasHim(): boolean {
            if (this.getCountdown() == 0) {
                return true;
            }
            return false;
        }

        public isCounting(): boolean {
            return this.counting;
        }

        public getCountdown(): number {
            return Math.max(Math.floor(this.countdown / 1000), 0);
        }

        protected updateGaz(_factor: number): void {

        }

        private updateCountdown(): void {
            if (this.distPlayer > 10) {
                this.counting = false;
                this.countdown = this.config.captureTime;
            } else {
                this.counting = true;
                this.countdown -= ƒ.Loop.timeFrameGame;
            }
        }

        private hndCollision = (_event: ƒ.EventPhysics): void => {
            let node: ƒ.Node = _event.cmpRigidbody.node;
            if (node.name == "PlayerMain") {
                this.carNode.dispatchEvent(this.gottchaEvent);
            }
        }

        private getDir(): ƒ.Vector2 {
            let vDir: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(this.player.getPosition(), this.mainRB.getPosition());
            vDir.normalize();
            let vRot: ƒ.Vector3 = this.main.mtxLocal.getEulerAngles();
            return this.evalDir(this.getRelative2Dvector(vDir, vRot, this.initAngles));
        }

        private evalDir(vDir: ƒ.Vector2): ƒ.Vector2 {
            if (this.distPlayer > 20 && vDir.y <= 0) {
                vDir.set(vDir.x, -vDir.y);
            }
            //console.log("x: " + Math.round(vDir.x * 100) / 100 + ", y: " + Math.round(vDir.y * 100) / 100);
            return vDir;
        }

        private setupPoliceCar(_config: Config, _carNode: ƒ.Node): void {
            this.carNode = _carNode;
            this.main = _carNode.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];

            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.bumperRB = this.main.getChildrenByName("RigidBodies")[0].getChildren()[0].getComponent(ƒ.ComponentRigidbody);

            this.bumperWeld = new ƒ.JointWelding(this.mainRB, this.bumperRB);
            this.main.addComponent(this.bumperWeld);

            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.bumperRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, this.hndCollision);

            this.engineSoundComponent = <ƒ.ComponentAudio>this.main.getChildrenByName("Audio")[0].getAllComponents()[0];
            this.sirenSoundComponent = <ƒ.ComponentAudio>this.main.getChildrenByName("Audio")[0].getAllComponents()[1];

            this.pos = this.mainRB.getPosition();
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);

            this.countdown = this.config.captureTime;
        }
    }
}
