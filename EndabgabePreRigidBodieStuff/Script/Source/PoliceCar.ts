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
            this.rigidBody = this.main.getComponent(ƒ.ComponentRigidbody);
            //this.rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }

        public update(): void {
            let tempDir: ƒ.Vector2 = this.getDir();
            this.updateTurning(this.updateDriving(tempDir.x), tempDir.y);
            //this.updateTurning(this.updateDriving(0), 0);
        }

        protected updateDriving(_imputDrive: number): number {
            let inputDrive: number = _imputDrive;
            if (this.ctrlDrive.getOutput() >= 0) {              //Driving Forward
                this.ctrlDrive.setDelay(this.config.pAccelSpeed);
                this.ctrlDrive.setFactor(this.config.pMaxSpeed);
            } else {                                              //Driving Backward
                this.ctrlDrive.setDelay(this.config.pAccelSpeed / 3);
                this.ctrlDrive.setFactor(this.config.pMaxSpeed / 3);
            }
            if (this.wasTurning) {
                inputDrive = inputDrive * 0.7;
            }
            this.ctrlDrive.setInput(inputDrive);
            this.carNode.mtxLocal.rotateX(this.ctrlDrive.getOutput());
            return this.ctrlDrive.getOutput();//ehemals Loop Frame Time
        }

        private getDir(): ƒ.Vector2 {
            let v1: ƒ.Vector3 = this.main.mtxWorld.translation;
            let v2: ƒ.Vector3 = this.player.getPosition();
            let vR: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(v2, v1);
            vR.normalize();
            let vRot: ƒ.Vector3 = ƒ.Vector3.SCALE(this.carNode.mtxLocal.getEulerAngles(), -1);
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
            }else{
                return new ƒ.Vector2(destNode.mtxWorld.translation.z, destNode.mtxWorld.translation.x);
            }
        }
    }
}
