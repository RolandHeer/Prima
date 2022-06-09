namespace Endabgabe {
    import ƒ = FudgeCore;

    export class Car {

        private config: Config;
        private car: ƒ.Node;
        private chassis: ƒ.Node;
        private rigidBody: ƒ.ComponentRigidbody;
        private mtxCar: ƒ.ComponentTransform;

        private ctrlDrive: ƒ.Control;
        private ctrlTurn: ƒ.Control;
        private currentSpeed: number;

        // Runtime Values 
        private gaz: number = 100;
        private posArray: ƒ.Vector3[] = []

        constructor(_config: Config, _car: ƒ.Node) {
            this.config = _config;
            this.car = _car;
            this.chassis = _car.getChildren()[0];
            this.rigidBody = this.chassis.getComponent(ƒ.ComponentRigidbody);
            this.mtxCar = this.car.getComponent(ƒ.ComponentTransform);
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

        private updateDriving(): number {
            let inputDrive: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
            if (inputDrive != 0 && this.gaz == 0) {
                inputDrive = 0;
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
            this.updateTilt(_drive, this.ctrlTurn.getOutput());
        }

        private updateTilt(_drive: number, _turn: number): void {
            if (_drive > 0) {
                this.chassis.getComponents(ƒ.ComponentMesh)[0].mtxPivot.rotation = ƒ.Vector3.Z((_drive * _turn) * 5);
            } else {
                this.chassis.getComponents(ƒ.ComponentMesh)[0].mtxPivot.rotation = ƒ.Vector3.Z((-_drive * _turn) * 5);
            }
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
            this.ctrlDrive = new ƒ.Control("cntrlWalk", _config.maxSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlDrive.setDelay(_config.accelSpeed);
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }
    }
}