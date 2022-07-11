namespace Endabgabe {
    import ƒ = FudgeCore;

    export class PlayerCar extends Car {

        // Runtime Values 
        private score: number = 0;
        private camPosArray: ƒ.Vector3[] = [];

        constructor(_config: Config, _car: ƒ.Node, _world: World) {
            super();
            this.config = _config;
            this.world = _world;
            this.world.setPlayerCar(this);

            this.carNode = _car;
            this.main = _car.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];

            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.carNode.addComponent(this.sphericalJoint);
            this.mainRB.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);

            this.pos = ƒ.Vector3.SCALE(this.mainRB.getPosition(),1);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }

        public update(): void {
            //this.updateDriving(ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]));
            this.updateTurning(this.updateDriving(ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])), ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
            this.pinToGround();
            this.setSpeed();
            this.updateCamPosArray();
            this.updatePos();
        }

        public incScore(): void {
            this.score++;
        }

        public fillTank(): void {
            this.gaz = 100;
        }

        public getCamPos(): ƒ.Vector3 {
            return this.camPosArray[0];
        }

        public getGazPercent(): number {
            return this.gaz;
        }

        public getScore(): number {
            return this.score;
        }

        public getPosition(): ƒ.Vector3 {
            return ƒ.Vector3.SCALE(this.mainRB.getPosition(),1);
        }

        private hndCollision = (_event: ƒ.EventPhysics): void => {
            let graph: ƒ.GraphInstance = <ƒ.GraphInstance>_event.cmpRigidbody.node;
            if (graph.idSource == World.coinGraphID || graph.idSource == World.canGraphID) {
                this.world.addToDoomedCollectables(graph);
            }
        }

        protected updateGaz(_factor: number): void {
            this.gaz = Math.max(0, this.gaz - 0.05 * Math.abs(_factor));
        }

        private updateCamPosArray(): void {
            let tempPos: ƒ.Vector3 = this.main.mtxLocal.getEulerAngles();
            let newPos: ƒ.Vector3 = new ƒ.Vector3(tempPos.x, tempPos.y, tempPos.z);

            this.camPosArray.push(newPos);
            if (this.camPosArray.length > this.config.camDelay) {
                this.camPosArray.splice(0, 1);
            }
        }
    }
}