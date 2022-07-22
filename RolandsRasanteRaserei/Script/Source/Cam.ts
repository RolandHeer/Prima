namespace Raserei {
    import ƒ = FudgeCore;
    export class Cam {
        /*private config: Config;
        private centerRB: ƒ.ComponentRigidbody;
        private main: ƒ.Node;
        private mainRB: ƒ.ComponentRigidbody;
        private reAnker: ƒ.Node;*/
        private camNode: ƒ.Node;

        constructor(_camNode: ƒ.Node, _carPos: ƒ.Vector3, _config: Config) {        //QUICK DISCLAIMER> All der auskommentierte Code war der klägliche Versuch die Kamera Physikbasiert zu machen... allerdings scheint die das gar nicht zu brauchen, ganz zu schweigen davon, dass es ohnehin nur semi-geil funktioniert hat... anyways... ich lass das mal hier falls es sich doch rausstelt dass es benötigt werden könnte.
            //this.config = _config;
            this.camNode = _camNode;
            //this.centerRB = this.camNode.getComponent(ƒ.ComponentRigidbody);
            //this.main = this.camNode.getChildren()[0];
            //this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            //let sphericalJoint: ƒ.JointSpherical = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            //sphericalJoint.springFrequency = 0;
            //this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_2;
            //this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_2;
            //this.reAnker = this.main.getChildren()[0].getChildren()[0];
            //this.camNode.addComponent(sphericalJoint);
        }

        public update(_newDestRot: ƒ.Vector3) {
            this.camNode.mtxLocal.rotation = _newDestRot;
            /*
            let f: number = ƒ.Loop.timeFrameGame / this.config.speedDivider;
            this.mainRB.applyForce(ƒ.Vector3.SCALE(ƒ.Vector3.DIFFERENCE(_newDestPos, this.mainRB.getPosition()), 50 * f));//Force into new Position
            this.pinToGround();
            this.mainRB.setRotation(_newDestRot);
           // this.reAnker.mtxLocal.lookAt(new ƒ.Vector3(0.01, 0.01, 0.01), this.main.mtxLocal.getY(), true);*/
        }

        //private pinToGround(): void {
            //this.mainRB.setPosition(ƒ.Vector3.NORMALIZATION(this.mainRB.getPosition(), 53)); //setzt den Abstand zur Weltmitte auf genau 50.4 (weltradius 50 plus abstand rigid body);
        //}
    }
}