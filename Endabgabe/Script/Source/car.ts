namespace Endabgabe {
    import ƒ = FudgeCore;

    export class Car {

        private config: Config;
        private car: ƒ.Node;
        private main: ƒ.Node;
        private body: ƒ.Node;
        private rigidBody: ƒ.ComponentRigidbody;
        private mtxTireL: ƒ.Matrix4x4;
        private mtxTireR: ƒ.Matrix4x4;

        private ctrlDrive: ƒ.Control;
        private ctrlTurn: ƒ.Control;
        private currentSpeed: number;

        // Runtime Values 
        private gaz: number = 100;
        private score: number = 0;
        private posArray: ƒ.Vector3[] = [];
        //private oldDrive: number = 0;

        constructor(_config: Config, _car: ƒ.Node) {
            this.config = _config;
            this.car = _car;
            this.main = _car.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];
            this.rigidBody = this.main.getComponent(ƒ.ComponentRigidbody);
            this.rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }

        public update(): void {
            this.updateTurning(this.updateDriving());
            this.updatePosArray();
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

        public getScore(): number{
            return this.score;
        }

        private hndCollision =(_event: ƒ.EventPhysics): void =>{
            let graph: ƒ.GraphInstance = <ƒ.GraphInstance>_event.cmpRigidbody.node;
            if(graph.idSource == World.coinGraphID){
                this.score ++;
                graph.getParent().getParent().removeChild(graph.getParent());
            }
            if(graph.idSource == World.canGraphID){
                this.gaz = 100;
                graph.getParent().getParent().removeChild(graph.getParent());
            }
        }

        private updateDriving(): number {
            let inputDrive: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
            if (this.ctrlDrive.getOutput() >= 0) {              //Driving Forward
                this.ctrlDrive.setFactor(this.config.maxSpeed);
                if(this.gaz == 0 && inputDrive > 0){            //Disable Speedup without gaz while still beeing able to break
                    inputDrive = 0;
                }
            }else{                                              //Driving Backward
                this.ctrlDrive.setFactor(this.config.maxSpeed/3);
                if(this.gaz == 0 && inputDrive < 0){            //Disable Speedup without gaz while still beeing able to break
                    inputDrive = 0;
                }
            }
            this.ctrlDrive.setInput(inputDrive);
            this.car.mtxLocal.rotateX(this.ctrlDrive.getOutput());//ehemals Loop Frame Time
            this.currentSpeed = this.ctrlDrive.getOutput();
            this.updateGaz(this.ctrlDrive.getOutput());//ehemals Loop Frame Time
            return this.ctrlDrive.getOutput();//ehemals Loop Frame Time
        }

        private updateTurning(_drive: number): void {
            let inputTurn: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])
            this.ctrlTurn.setInput(inputTurn);
            if (_drive > 0) {
                this.car.mtxLocal.rotateY(this.ctrlTurn.getOutput() * Math.min(0.3, _drive));//ehemals Loop Frame Time
            } else {
                this.car.mtxLocal.rotateY(this.ctrlTurn.getOutput() * Math.max(-0.3, _drive));//ehemals Loop Frame Time
            }
            this.updateYawTilt(_drive, this.ctrlTurn.getOutput());
            this.updateWheels(this.ctrlTurn.getOutput());
        }

        private updateYawTilt(_drive: number, _turn: number): void {
            if (_drive > 0) {
                this.body.mtxLocal.rotation = new ƒ.Vector3(0, 0, (_drive * _turn) * 3);
            } else {
                this.body.mtxLocal.rotation = new ƒ.Vector3(0, 0, (-_drive * _turn) * 3);
            }
            //this.oldDrive = _drive;
        }

        private updateWheels(_turn: number): void {
            this.mtxTireL.rotation = ƒ.Vector3.Y(_turn * 4);
            this.mtxTireR.rotation = ƒ.Vector3.Y(_turn * 4);
        }

        private updateGaz(_factor: number): void {
            this.gaz = Math.max(0, this.gaz - 0.05 * Math.abs(_factor));
        }

        private updatePosArray(): void {
            let tempPos: ƒ.Vector3 = this.car.mtxLocal.getEulerAngles();
            let newPos: ƒ.Vector3 = new ƒ.Vector3(tempPos.x, tempPos.y, tempPos.z)
            this.posArray.push(newPos);
            if (this.posArray.length > this.config.camDelay) {
                this.posArray.splice(0, 1);
            }
        }

        private setupControls(_config: Config): void {
            this.ctrlDrive = new ƒ.Control("cntrlDrive", _config.maxSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlDrive.setDelay(_config.accelSpeed);
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }
    }
}