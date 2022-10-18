namespace Raserei {
    import ƒ = FudgeCore;
    export class PoliceCar extends Car {

        private player: PlayerCar;
        private countdown: number;
        private counting: boolean = false;
        private sirenSoundComponent: ƒ.ComponentAudio;
        public gottchaEvent: CustomEvent = new CustomEvent("gottcha", {
            detail: {
                message: "I got him lads!"
            }
        });

        constructor(_config: Config, _carNode: ƒ.Node, _player: PlayerCar) {
            super();
            this.config = _config;
            this.player = _player;
            this.isPolice = true;

            this.carNode = _carNode;
            this.main = _carNode.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];

            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, this.hndCollision);
            this.mainRB.setPosition(new ƒ.Vector3(0, 0, -50.5));
            this.mainRB.setRotation(new ƒ.Vector3(-90, 0, 0));

            this.engineSoundComponent = <ƒ.ComponentAudio>this.main.getChildrenByName("Audio")[0].getAllComponents()[0];
            this.sirenSoundComponent = <ƒ.ComponentAudio>this.main.getChildrenByName("Audio")[0].getAllComponents()[1];

            this.pos = this.mainRB.getPosition();
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);

            this.countdown = this.config.captureTime;
        }

        public update(_playing: boolean): void {
            let dir: ƒ.Vector2 = this.getDir();
            this.updateTurning(this.updateDriving(dir.y), dir.x);
            this.pinToGround();
            this.updatePos();
            this.updateCountdown();
            if(!_playing){
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
            if(this.mainRB.getPosition().getDistance(this.player.getPosition()) > 10){
                this.counting = false;
                this.countdown = this.config.captureTime;
            }else{
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
            return this.getRelative2Dvector(vDir, this.main.mtxLocal.getEulerAngles());;
        }
    }
}
