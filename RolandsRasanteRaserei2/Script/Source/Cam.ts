namespace Raserei {
    import ƒ = FudgeCore;
    export class Cam {
        private viewport: ƒ.Viewport;
        private camNode: ƒ.Node;

        //Cameras
        private activeCam: number = 0;
        private camArray: ƒ.ComponentCamera[] = [];
        private camRear: ƒ.ComponentCamera;

        constructor(_camNode: ƒ.Node,_carBodyNode: ƒ.Node, _viewport: ƒ.Viewport) {
            this.viewport = _viewport;
            this.camNode = _camNode;
            let cams: ƒ.Node = this.camNode.getChildren()[0];

            this.camArray.push(
                cams.getChildren()[0].getComponent(ƒ.ComponentCamera),
                cams.getChildren()[1].getComponent(ƒ.ComponentCamera),
                _carBodyNode.getChildrenByName("cam2")[0].getComponent(ƒ.ComponentCamera),
                _carBodyNode.getChildrenByName("cam3")[0].getComponent(ƒ.ComponentCamera),);

            this.camRear = this.camNode.getChildren()[0].getChildren()[2].getComponent(ƒ.ComponentCamera);
        }

        public update(_newDestRot: ƒ.Vector3) {
            this.camNode.mtxLocal.rotation = _newDestRot;
        }
        public toggle(): void {
            this.camArray[this.activeCam].activate(false);
            this.activeCam = (this.activeCam + 1) % 4;
            this.camArray[this.activeCam].activate(true);
            this.viewport.camera = this.camArray[this.activeCam];
        }
        public reverse(_bool: boolean): void {
            if (_bool) {
                this.camArray[this.activeCam].activate(false);
                this.camRear.activate(true);
                this.viewport.camera = this.camRear;
            } else {
                this.camRear.activate(false);
                this.camArray[this.activeCam].activate(true);
                this.viewport.camera = this.camArray[this.activeCam];
            }
        }
    }
}