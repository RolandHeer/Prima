namespace Endabgabe {
    import ƒ = FudgeCore;
    export abstract class Car {

        protected config: Config;
        protected carNode: ƒ.Node;
        protected main: ƒ.Node;
        protected body: ƒ.Node;
        protected centerRB: ƒ.ComponentRigidbody;
        protected mainRB: ƒ.ComponentRigidbody;
        protected sphericalJoint: ƒ.JointSpherical;
        protected mtxTireL: ƒ.Matrix4x4;
        protected mtxTireR: ƒ.Matrix4x4;

        protected world: World;

        protected ctrlDrive: ƒ.Control;
        protected ctrlTurn: ƒ.Control;
        protected gaz: number= 100;
        protected currentSpeed: number = 0;
        protected wasTurning: boolean;
        protected factor: number = 1;

        public abstract update(): void;

        protected updateDriving(_inputDrive: number): number {
            if (_inputDrive >= 0) {              //Driving Forward
                if (this.gaz == 0) {            //Disable Speedup without gaz while still beeing able to break
                    _inputDrive = 0;
                }
            } else {                            //Driving Backward
                if (this.gaz == 0) {            //Disable Speedup without gaz while still beeing able to break
                    _inputDrive = 0;
                }
            }
            if (this.wasTurning) {
                _inputDrive = _inputDrive * 0.7;
            }
            this.ctrlDrive.setInput(_inputDrive);
            this.mainRB.applyForce(ƒ.Vector3.SCALE(this.main.mtxLocal.getZ(), _inputDrive * 60));
            this.currentSpeed = this.ctrlDrive.getOutput() * this.factor;
            this.updateGaz(this.ctrlDrive.getOutput());//ehemals Loop Frame Time
            return this.ctrlDrive.getOutput();//ehemals Loop Frame Time
        }

        protected updateTurning(_drive: number, _turnInput: number): void {
            this.ctrlTurn.setInput(_turnInput);
            if (_drive > 0) {
                this.mainRB.rotateBody(ƒ.Vector3.SCALE(this.main.mtxLocal.getY(), this.ctrlTurn.getOutput() * Math.min(0.3, _drive)));
            } else {
                this.mainRB.rotateBody(ƒ.Vector3.SCALE(this.main.mtxLocal.getY(), this.ctrlTurn.getOutput() * Math.min(-0.3, _drive)));
            }
            if (Math.abs(_turnInput) > 0) {
                this.wasTurning = true;
            } else {
                this.wasTurning = false;
            }
            this.updateTilt(_drive, this.ctrlTurn.getOutput());
            this.updateWheels(this.ctrlTurn.getOutput());
        }

        protected pinToGround(): void{
            this.mainRB.setPosition(ƒ.Vector3.NORMALIZATION(this.mainRB.getPosition(), 50.4)); //setzt den Abstand zur Weltmitte auf genau 50.4 (weltradius 50 plus abstand rigid body);
        }

        protected updateTilt(_drive: number, _turn: number): void {
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

        protected abstract updateGaz(_factor: number): void;
        protected setupControls(_config: Config): void {
            this.ctrlDrive = new ƒ.Control("cntrlDrive", _config.maxSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlDrive.setDelay(_config.accelSpeed);
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }
    }
}