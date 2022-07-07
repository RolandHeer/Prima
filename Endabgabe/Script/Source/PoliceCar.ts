namespace Endabgabe {
    import ƒ = FudgeCore;
    export class PoliceCar extends Car {

        private player: PlayerCar;
        private policeNode: ƒ.Node;

        constructor(_config: Config, _carNode: ƒ.Node, _player: PlayerCar) {
            super();
            this.config = _config;
            this.carNode = _carNode;
            this.policeNode = this.carNode.getParent().getParent();
            this.player = _player;
            this.main = _carNode.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];
            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            //this.rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }

        public update(): void {
            let tempDir: ƒ.Vector2 = this.getDir();
            this.updateTurning(this.updateDriving(tempDir.x), tempDir.y);
            this.pinToGround();
        }

        protected updateGaz(_factor: number): void {
            
        }

        private getDir(): ƒ.Vector2 {
            let v1: ƒ.Vector3 = this.main.mtxWorld.translation;
            let v2: ƒ.Vector3 = this.player.getPosition();
            let vR: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(v2, v1);
            vR.normalize();
            let vRot: ƒ.Vector3 = ƒ.Vector3.SCALE(this.main.mtxLocal.getEulerAngles(), -1);
            let testNode: ƒ.Node = this.policeNode.getChildrenByName("TestNode")[0];
            let destNode: ƒ.Node = testNode.getChildren()[0];
            testNode.mtxLocal.rotation = ƒ.Vector3.ZERO();
            destNode.mtxLocal.translation = vR;
            testNode.mtxLocal.rotateX(vRot.x);
            testNode.mtxLocal.rotateY(vRot.y);
            testNode.mtxLocal.rotateZ(vRot.z);
            //console.log("x: " + Math.round(destNode.mtxWorld.translation.x) + ", z: " + Math.round(destNode.mtxWorld.translation.z));
            if (v1.getDistance(v2) > 4 && destNode.mtxWorld.translation.z < 0) {
                return new ƒ.Vector2(destNode.mtxWorld.translation.z, destNode.mtxWorld.translation.x); //um die Polizei logisch fahren zu lassen müsste hier in den "umdrehmodus" gewechselt werden
            } else {
                return new ƒ.Vector2(destNode.mtxWorld.translation.z, destNode.mtxWorld.translation.x);
            }
        }
    }
}
