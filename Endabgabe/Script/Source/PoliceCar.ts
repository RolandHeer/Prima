namespace Endabgabe {
    import ƒ = FudgeCore;
    export class PoliceCar extends Car {

        private player: PlayerCar;
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
            this.mainRB.setPosition(new ƒ.Vector3(0,0,-50.5));
            this.mainRB.setRotation(new ƒ.Vector3(-90,0,0));

            this.engineSoundComponent = <ƒ.ComponentAudio>this.main.getChildrenByName("Audio")[0].getAllComponents()[0];

            this.pos = this.mainRB.getPosition();
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }

        public update(): void {
            let dir: ƒ.Vector2 = this.getDir();
            this.updateTurning(this.updateDriving(dir.y), dir.x);
            this.pinToGround();
            this.updatePos();
        }

        protected updateGaz(_factor: number): void {

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
