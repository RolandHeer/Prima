namespace Endabgabe {
    import ƒ = FudgeCore;
    export abstract class Car {

        protected config: Config;
        protected carNode: ƒ.Node;
        protected main: ƒ.Node;
        protected body: ƒ.Node;
        protected rigidBody: ƒ.ComponentRigidbody;
        protected mtxTireL: ƒ.Matrix4x4;
        protected mtxTireR: ƒ.Matrix4x4;

        protected ctrlDrive: ƒ.Control;
        protected ctrlTurn: ƒ.Control;

        public abstract update(): void;

        protected abstract updateDriving(_inputDrive: number): number;

        protected updateTurning(_drive: number, _turnInput: number): void {
            this.ctrlTurn.setInput(_turnInput);
            if (_drive > 0) {
                this.carNode.mtxLocal.rotateY(this.ctrlTurn.getOutput() * Math.min(0.3, _drive));
            } else {
                this.carNode.mtxLocal.rotateY(this.ctrlTurn.getOutput() * Math.min(-0.3, _drive));
            }
            this.updateYawTilt(_drive, this.ctrlTurn.getOutput());
            this.updateWheels(this.ctrlTurn.getOutput());
        }

        protected updateYawTilt(_drive: number, _turn: number): void {
            if (_drive > 0) {
                this.body.mtxLocal.rotation = new ƒ.Vector3(0, 0, (_drive * _turn) * 3);
            } else {
                this.body.mtxLocal.rotation = new ƒ.Vector3(0, 0, (-_drive * _turn) * 3);
            }
        }

        protected updateWheels(_turn: number): void {
            let tempV: ƒ.Vector3 = new ƒ.Vector3(0, _turn * 4, -_turn * 2);
            this.mtxTireL.rotation = tempV;
            this.mtxTireR.rotation = tempV;
        }

        protected setupControls(_config: Config): void {
            this.ctrlDrive = new ƒ.Control("cntrlDrive", _config.maxSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlDrive.setDelay(_config.accelSpeed);
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }
    }
}