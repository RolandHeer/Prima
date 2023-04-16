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
        protected smokeEmitter: ƒ.Node;

        //REFERENCES
        protected initTransform: ƒ.Matrix4x4;
        protected initAngles: ƒ.Vector3;
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
        protected gripFactor: number = 0.0;               // 0 = no grip, 1 = full grip
        protected lastInputDrive: number;

        protected isPolice: boolean = false;

        constructor(_carMainNode: ƒ.Node) {
            this.initTransform = _carMainNode.mtxLocal;             //The Local Matrix of the Main RB-Object is used to determine all sorts of stuff. It is altered however, if we change the transform of its parents. This unfortunately is needed to easily place the car anywhere in the world. To counteract the transform of the parent object is stored to base the calculations on.
            this.initAngles = this.initTransform.getEulerAngles();
            this.smokeEmitter = _carMainNode.getChildren()[0].getChildrenByName("SmokeEmitter")[0];
        }

        public abstract update(_driving: boolean, _f: number): void;

        public getSpeedPercent(): number {
            return this.currentSpeed / 0.025;
        }

        protected updateDriving(_inputDrive: number, _f: number): number {  //PROBLEM: MAN MUSS FESTSTELLEN OB SICH DER WAGEN NACH VORN ODER HINTEN BEWEGT allerdings hat es sich noch nicht bewegt... menno
            _f = Math.min(_f / this.config.speedDivider, 3)
            let forward: number;
            let mtxLocal: ƒ.Matrix4x4 = this.main.mtxLocal;

            let relativeZ: ƒ.Vector3 = mtxLocal.getZ();
            relativeZ.transform(this.initTransform);

            forward = this.getForward(relativeZ);
            _inputDrive = this.evalInputDrive(_inputDrive, forward);

            this.handleGrip(forward, relativeZ, _f);

            this.mainRB.applyForce(ƒ.Vector3.SCALE(relativeZ, _inputDrive * 150 * _f));
            this.updateGaz(this.getSpeedPercent() * (Math.abs(_inputDrive * 2) * _f));

            this.lastInputDrive = _inputDrive;

            if (forward > 0) {
                return this.getSpeedPercent();
            } else {
                return -this.getSpeedPercent();
            }
        }

        protected updateTurning(_drive: number, _turnInput: number): void {
            let relativeY: ƒ.Vector3 = this.main.mtxLocal.getY();
            relativeY.transform(this.initTransform);

            this.ctrlTurn.setInput(_turnInput);
            this.mainRB.rotateBody((ƒ.Vector3.SCALE(relativeY, (this.ctrlTurn.getOutput() * Math.min(0.3, _drive) * averageDeltaTime) / this.config.turnDivider)));
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
            this.currentSpeed = ƒ.Vector3.ZERO().getDistance(this.velocity) / averageDeltaTime;
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

        protected handleGrip(_forward: number, _relativeZ: ƒ.Vector3, _f: number): void {
            //The initial velocity is removed (while considering the gripFactor) and then the velocity strength is added to the direction the car is actually facing
            if (_forward >= 0) {
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.velocity, -1000 * this.gripFactor * _f));
                this.mainRB.applyForce(ƒ.Vector3.SCALE(_relativeZ, ƒ.Vector3.ZERO().getDistance(this.velocity) * (1100 * this.gripFactor) * _f));
            } else {
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.velocity, -1000 * this.gripFactor * _f));
                this.mainRB.applyForce(ƒ.Vector3.SCALE(_relativeZ, ƒ.Vector3.ZERO().getDistance(this.velocity) * (-1100 * this.gripFactor) * _f));
            }
        }

        protected updateSmoke(): void {
            this.world.addSmoke(this.smokeEmitter.mtxWorld.translation, 0.97 - (Math.min(Math.abs(this.lastInputDrive), 1) * 0.1));
        }

        protected getRelative2Dvector(_vDir: ƒ.Vector3, _vRot: ƒ.Vector3, _vInitRot: ƒ.Vector3): ƒ.Vector2 {
            let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
            let vRot: ƒ.Vector3 = ƒ.Vector3.SCALE(_vRot, -1);
            let vInitRot: ƒ.Vector3 = ƒ.Vector3.SCALE(_vInitRot, -1);
            let vDir: ƒ.Vector3 = ƒ.Vector3.SCALE(_vDir, 1);

            mtx.rotateX(vRot.x);
            mtx.rotateY(vRot.y);
            mtx.rotateZ(vRot.z);

            mtx.rotateX(vInitRot.x);
            mtx.rotateY(vInitRot.y);
            mtx.rotateZ(vInitRot.z);
            mtx.translate(vDir, true);

            return new ƒ.Vector2(mtx.translation.x, mtx.translation.z);
        }

        protected abstract updateGaz(_factor: number): void;
        protected setupControls(_config: Config): void {
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }

        protected getForward(_relativeZ: ƒ.Vector3): number {
            let dot: number = ƒ.Vector3.DOT(this.velocity, _relativeZ);
            if (dot > 0) {
                return 1;
            } else if (dot < 0) {
                return -1;
            }
            return 0;
        }

        protected evalInputDrive(_inputDrive: number, _forward: number): number {
            if (this.gaz == 0) {
                if (_forward == 1 && _inputDrive >= 0) {         //Driving Forward
                    _inputDrive = 0;                            //Disable Speedup without gaz while still beeing able to break
                } else if (_forward == -1 && _inputDrive < 0) {  //Driving Backward
                    _inputDrive = 0;                            //Disable Speedup without gaz while still beeing able to break
                } else if (_forward == 0) {                      //Standing Still
                    _inputDrive = 0;                            //Disable Speedup without gaz
                }
            }

            if (_inputDrive < 0 && _forward <= 0) {              //Reduce speed while driving backwards
                _inputDrive = _inputDrive / 3;
            }
            return _inputDrive;
        }
    }
}