namespace Endabgabe {
    import ƒ = FudgeCore;

    interface Config {
        fontHeight: number;
        margin: number;
        maxSpeed: number;
        accelSpeed: number;
        maxTurn: number;
        accelTurn: number;
        [key: string]: number | string | Config;
    }

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
            this.updateGaz();
        }

        public getSpeedPercent(): number {
            return this.currentSpeed / this.config.maxSpeed;
        }

        public getGazPercent(): number {
            return this.gaz;
        }

        private updateDriving(): number {
            let inputDrive: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
            this.ctrlDrive.setInput(inputDrive);
            this.car.mtxLocal.rotateX(this.ctrlDrive.getOutput() * ƒ.Loop.timeFrameGame);
            this.currentSpeed = this.ctrlDrive.getOutput();
            this.updateGaz(this.ctrlDrive.getOutput() * ƒ.Loop.timeFrameGame);
            return this.ctrlDrive.getOutput() * ƒ.Loop.timeFrameGame;
        }

        private updateTurning(_driving: number): void {
            let inputTurn: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])
            this.ctrlTurn.setInput(inputTurn);
            if (_driving > 0) {
                this.car.mtxLocal.rotateY(this.ctrlTurn.getOutput() * Math.min(1, _driving) * ƒ.Loop.timeFrameGame);
            } else {
                this.car.mtxLocal.rotateY(this.ctrlTurn.getOutput() * Math.max(-1, _driving) * ƒ.Loop.timeFrameGame);
            }
        }

        private updateGaz(_factor: number): void {
            Math.max(0, this.gaz -= 0.1 * _factor);
        }

        private setupControls(_config: Config): void {
            this.ctrlDrive = new ƒ.Control("cntrlWalk", _config.maxSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlDrive.setDelay(_config.accelSpeed);
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }
    }
}