namespace Endabgabe {
    import ƒ = FudgeCore;

    export class PlayerCar extends Car {

        // Runtime Values 
        private currentSpeed: number = 0;
        private gaz: number = 100;
        private score: number = 0;
        private posArray: ƒ.Vector3[] = [];

        constructor(_config: Config, _car: ƒ.Node) {
            super();
            this.config = _config;
            this.carNode = _car;
            this.main = _car.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];
            this.rigidBody = this.main.getComponent(ƒ.ComponentRigidbody);
            this.rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }

        public update(): void {
            //console.log("local y: " + Math.round(this.main.mtxLocal.translation.y) + ", world y: " + Math.round(this.main.mtxWorld.translation.y));
            this.updateTurning(this.updateDriving(), ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
            this.updatePosArray();
           // this.applyRotation();
        }

        public getCamPos(): ƒ.Vector3 {
            return this.posArray[0];
        }

        public getSpeedPercent(): number {
            return this.currentSpeed / this.config.maxSpeed;
        }

        public getGazPercent(): number {
            return this.gaz;
        }

        public getScore(): number {
            return this.score;
        }

        public getPosition(): ƒ.Vector3 {
            return this.main.mtxWorld.translation;
        }


        protected updateDriving(): number {
            let inputDrive: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
            if (this.ctrlDrive.getOutput() >= 0) {              //Driving Forward
                this.ctrlDrive.setDelay(this.config.accelSpeed);
                this.ctrlDrive.setFactor(this.config.maxSpeed);
                if (this.gaz == 0 && inputDrive > 0) {            //Disable Speedup without gaz while still beeing able to break
                    inputDrive = 0;
                }
            } else {                                              //Driving Backward
                this.ctrlDrive.setDelay(this.config.accelSpeed / 3);
                this.ctrlDrive.setFactor(this.config.maxSpeed / 3);
                if (this.gaz == 0 && inputDrive < 0) {            //Disable Speedup without gaz while still beeing able to break
                    inputDrive = 0;
                }
            }
            this.ctrlDrive.setInput(inputDrive);
            this.carNode.mtxLocal.rotateX(this.ctrlDrive.getOutput());
            this.currentSpeed = this.ctrlDrive.getOutput();
            this.updateGaz(this.ctrlDrive.getOutput());//ehemals Loop Frame Time
            return this.ctrlDrive.getOutput();//ehemals Loop Frame Time
        }

        private hndCollision = (_event: ƒ.EventPhysics): void => {
            let graph: ƒ.GraphInstance = <ƒ.GraphInstance>_event.cmpRigidbody.node;
            if (graph.idSource == World.coinGraphID) {
                this.score++;
                graph.getParent().getParent().removeChild(graph.getParent());
            }
            if (graph.idSource == World.canGraphID) {
                this.gaz = 100;
                graph.getParent().getParent().removeChild(graph.getParent());
            }
        }

        private updateGaz(_factor: number): void {
            this.gaz = Math.max(0, this.gaz - 0.05 * Math.abs(_factor));
        }

        private updatePosArray(): void {
            let tempPos: ƒ.Vector3 = this.carNode.mtxLocal.getEulerAngles();
            let newPos: ƒ.Vector3 = new ƒ.Vector3(tempPos.x, tempPos.y, tempPos.z);

            this.posArray.push(newPos);
            if (this.posArray.length > this.config.camDelay) {
                this.posArray.splice(0, 1);
            }
        }
    }
}