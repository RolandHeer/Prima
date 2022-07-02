namespace Endabgabe {
    import ƒ = FudgeCore;

    export class Cam {
        private camNode: ƒ.Node;
        constructor(_camNode: ƒ.Node) {
            this.camNode = _camNode;
        }

        public update(_newPos: ƒ.Vector3){
            this.camNode.mtxLocal.rotation = _newPos;
        }
    }
}