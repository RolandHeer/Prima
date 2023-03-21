namespace Raserei {
    import ƒ = FudgeCore;
    export abstract class Car {

        //OBJECTS
        protected config: Config;
        protected world: World;

        //NODES
        protected carNode: ƒ.Node;
        protected main: ƒ.Node;
        protected body: ƒ.Node;

        //REFERENCES
        protected centerRB: ƒ.ComponentRigidbody;
        protected mainRB: ƒ.ComponentRigidbody;
        protected bumperRB: ƒ.ComponentRigidbody;
        protected sphericalJoint: ƒ.JointSpherical;
        protected bumperWeld: ƒ.JointWelding;
        protected mtxTireL: ƒ.Matrix4x4;
        protected mtxTireR: ƒ.Matrix4x4;
        protected engineSoundComponent: ƒ.ComponentAudio;

        //RUNTIME VARIABLES
        protected ctrlTurn: ƒ.Control;
        protected velocity: ƒ.Vector3 = ƒ.Vector3.ZERO();
        protected pos: ƒ.Vector3;
        protected gaz: number = 100;
        protected currentSpeed: number = 0;
        protected gripFactor: number = 0.8;               // 0 = no grip, 1 = full grip

        protected isPolice: boolean = false;

        public abstract update(_driving: boolean): void;

        public getSpeedPercent(): number {
            return this.currentSpeed / 0.025;
        }

        protected updateDriving(_inputDrive: number): number {  //PROBLEM: MAN MUSS FESTSTELLEN OB SICH DER WAGEN NACH VORN ODER HINTEN BEWEGT allerdings hat es sich noch nicht bewegt... menno
            let forward: number;
            if (this.getRelative2Dvector(this.velocity, this.main.mtxLocal.getEulerAngles()).y > 0) {
                forward = 1;
            } else if (this.getRelative2Dvector(this.velocity, this.main.mtxLocal.getEulerAngles()).y < 0) {
                forward = -1;
            } else {
                forward = 0;
            }

            if (this.gaz == 0) {
                if (forward == 1 && _inputDrive >= 0) {         //Driving Forward
                    _inputDrive = 0;                            //Disable Speedup without gaz while still beeing able to break
                } else if (forward == -1 && _inputDrive < 0) {  //Driving Backward
                    _inputDrive = 0;                            //Disable Speedup without gaz while still beeing able to break
                } else if (forward == 0) {                      //Standing Still
                    _inputDrive = 0;                            //Disable Speedup without gaz
                }
            }
            if (_inputDrive < 0 && forward <= 0) {
                _inputDrive = _inputDrive / 3;
            }
            let f: number = ƒ.Loop.timeFrameGame / this.config.speedDivider;
            if (forward >= 0) {
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.velocity, -1000 * this.gripFactor * f));
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.main.mtxLocal.getZ(), ƒ.Vector3.ZERO().getDistance(this.velocity) * (1100 * this.gripFactor) * f));
            } else {
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.velocity, -1000 * this.gripFactor * f));
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.main.mtxLocal.getZ(), ƒ.Vector3.ZERO().getDistance(this.velocity) * (-1100 * this.gripFactor) * f));
            }
            
            this.mainRB.applyForce(ƒ.Vector3.SCALE(this.main.mtxLocal.getZ(), _inputDrive * 150 * f));
            this.updateGaz(this.getSpeedPercent() * (Math.abs(_inputDrive * 2) * f));//ehemals Loop Frame Time
            if (forward > 0) {
                return this.getSpeedPercent();
            } else {
                return -this.getSpeedPercent();
            }
        }

        protected updateTurning(_drive: number, _turnInput: number): void {
            this.ctrlTurn.setInput(_turnInput);
            this.mainRB.rotateBody((ƒ.Vector3.SCALE(this.main.mtxLocal.getY(), (this.ctrlTurn.getOutput() * Math.min(0.3, _drive) * averageDeltaTime) / this.config.turnDivider)));
            this.updateTilt(_drive, this.ctrlTurn.getOutput());
            this.updateWheels(this.ctrlTurn.getOutput());
        }

        protected pinToGround(): void {
            this.mainRB.setPosition(ƒ.Vector3.NORMALIZATION(this.mainRB.getPosition(), 50.50)); //setzt den Abstand zur Weltmitte auf genau 50.4 (weltradius 50 plus abstand rigid body);
        }

        protected updatePos(): void {
            this.velocity = ƒ.Vector3.DIFFERENCE(this.mainRB.getPosition(), this.pos);
            this.pos = ƒ.Vector3.SCALE(this.mainRB.getPosition(), 1);
            this.setSpeed();
        }

        protected setSpeed(): void {
            this.currentSpeed = ƒ.Vector3.ZERO().getDistance(this.velocity) / averageDeltaTime; //falls loop Frame Time doch noch verwendet werden sollte hier durch tatsächliche Zeit teilen
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

        protected updateSmoke(): void{
            this.world.addSmoke(this.pos);
        }

        protected getRelative2Dvector(_vDir: ƒ.Vector3, _vRot: ƒ.Vector3): ƒ.Vector2 {
            let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
            let refMtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
            let vRot: ƒ.Vector3 = ƒ.Vector3.SCALE(_vRot, -1);
            let vDir: ƒ.Vector3 = ƒ.Vector3.SCALE(_vDir, 1);
            mtx.rotateX(vRot.x);
            mtx.rotateY(vRot.y);
            mtx.rotateZ(vRot.z);
            mtx.translate(vDir, true);
            mtx.getTranslationTo(refMtx);
            return new ƒ.Vector2(mtx.translation.x, mtx.translation.z);
        }

        protected abstract updateGaz(_factor: number): void;
        protected setupControls(_config: Config): void {
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }

    }
}