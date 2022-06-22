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
            this.updateTurning(this.updateDriving(this.getDir().x), this.getDir().y);
        }

        protected updateDriving(_imputDrive: number): number {
            let inputDrive: number = _imputDrive;
            if (this.ctrlDrive.getOutput() >= 0) {              //Driving Forward
                this.ctrlDrive.setDelay(this.config.accelSpeed);
                this.ctrlDrive.setFactor(this.config.maxSpeed);
            } else {                                              //Driving Backward
                this.ctrlDrive.setDelay(this.config.accelSpeed / 3);
                this.ctrlDrive.setFactor(this.config.maxSpeed / 3);
            }
            this.ctrlDrive.setInput(inputDrive);
            this.carNode.mtxLocal.rotateX(this.ctrlDrive.getOutput());//ehemals Loop Frame Time
            return this.ctrlDrive.getOutput();//ehemals Loop Frame Time
        }

        private getDir(): ƒ.Vector2 {
            let v1: ƒ.Vector3 = this.rigidBody.getPosition();
            let v2: ƒ.Ray  = new ƒ.Ray(this.player.getPosition());
            let vR: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(v1,v2.intersectPlane(v1, v1));
            vR.normalize();

            let testNode: ƒ.Node = this.policeNode.getChildrenByName("TestNode")[0];
            let destNode: ƒ.Node = testNode.getChildren()[0];
            destNode.mtxLocal.translation = vR;
            testNode.mtxLocal.rotation = new ƒ.Vector3(-this.carNode.mtxLocal.rotation.x,-this.carNode.mtxLocal.rotation.y,-this.carNode.mtxLocal.rotation.z);
            //console.log("x: " + Math.round(destNode.mtxWorld.translation.x) + ", z: " + Math.round(destNode.mtxWorld.translation.z));
            return new ƒ.Vector2(-destNode.mtxWorld.translation.z,-destNode.mtxWorld.translation.x);
            /*let pPos: ƒ.Vector3 = this.player.getPosition();                                                                                                                      Längen und Breitengrade oder so
            console.log("Länge: " + Math.round(Vector.getRotOfXY(pPos.x, pPos.z)) + ", Breite: " + Math.round(Vector.getRotOfXY(Math.sqrt((pPos.x ^ 2) + (pPos.z ^ 2)), pPos.y)));*/
        }
    }
}
