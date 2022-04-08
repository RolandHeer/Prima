namespace Script {
    export class Ghost {

        private grid: ƒ.Node;
        private mrFudge: MrFudge;
        private translator: ƒ.Node;
        private materialComp: ƒ.ComponentMaterial;

        private speed: number = 1 / 22;
        private velocity: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
        private threshold: number = 0.1;

        constructor(_graph: ƒ.Node, _node: ƒ.Node, _mrFudge: MrFudge) {
            this.setup(_node);
            this.grid = _graph.getChildrenByName("Grid")[0];
            this.mrFudge = _mrFudge;
            this.translator = _node;
        }

        private setup(_node: ƒ.Node): void {
            let tempMaterial: ƒ.Material = new ƒ.Material("ghostMat", ƒ.ShaderLit);
            let tempMesh: ƒ.MeshSphere = new ƒ.MeshSphere("ghostSphere", 6, 6);

            this.materialComp = new ƒ.ComponentMaterial(tempMaterial);
            this.materialComp.clrPrimary = ƒ.Color.CSS("#ed0043");
            let tempMeshComp: ƒ.ComponentMesh = new ƒ.ComponentMesh(tempMesh);
            tempMeshComp.mtxPivot.scale(new ƒ.Vector3(0.8, 0.8, 0.8));
            let tempTransformComp: ƒ.ComponentTransform = new ƒ.ComponentTransform();

            _node.addComponent(tempTransformComp);
            _node.addComponent(this.materialComp);
            _node.addComponent(tempMeshComp);
            _node.mtxLocal.translation = new ƒ.Vector3(5, 5, 0.2);
        }

        public update(): void {
            this.move();
        }

        private move(): void {
            let tempPos: ƒ.Vector3 = this.translator.mtxLocal.translation;
            let t: number = this.threshold;
            if ((tempPos.y % 1) + t / 2 < t && (tempPos.x % 1) + t / 2 < t) {
                this.setDir();
            }
            this.translator.mtxLocal.translate(this.velocity);
            if (this.translator.mtxLocal.translation.getDistance(new ƒ.Vector3(this.mrFudge.getPos().x, this.mrFudge.getPos().y, 0)) < 0.6) {
                this.materialComp.clrPrimary = ƒ.Color.CSS("#fff");
                this.mrFudge.stop();
            }
        }
        private setDir(): void {
            let previousDir: ƒ.Vector3 = new ƒ.Vector3(this.velocity.x, this.velocity.y, 0);
            let xG: number = this.translator.mtxLocal.translation.x;
            let yG: number = this.translator.mtxLocal.translation.y;
            let xF: number = this.mrFudge.getPos().x;
            let yF: number = this.mrFudge.getPos().y;
            if (Math.abs(xG - xF) < Math.abs(yG - yF)) {
                if (yG > yF) {
                    this.velocity.set(0, -this.speed, 0);
                } else {
                    this.velocity.set(0, this.speed, 0);
                }
            } else {
                if (xG > xF) {
                    this.velocity.set(-this.speed, 0, 0);
                } else {
                    this.velocity.set(this.speed, 0, 0);
                }
            }
            if (!this.isPath(Math.round(this.velocity.x / this.speed), Math.round(this.velocity.y / this.speed))) {
                this.velocity.set(this.velocity.y, this.velocity.x);
                if (Math.round(this.velocity.x / this.speed) != this.mrFudge.getDir().x || Math.round(this.velocity.y / this.speed) != this.mrFudge.getDir().y) {
                    this.velocity.set(-this.velocity.x, -this.velocity.y, 0);
                }
            } else {
                return;
            }
            if (!this.isPath(Math.round(this.velocity.x / this.speed), Math.round(this.velocity.y / this.speed))) {
                this.velocity.set(-this.velocity.x, -this.velocity.y, 0);
            } else {
                return;
            }
            if (!this.isPath(Math.round(this.velocity.x / this.speed), Math.round(this.velocity.y / this.speed))) {
                this.velocity.set(-previousDir.x, -previousDir.y, 0);
            }
        }

        private isPath(_dirX: number, _dirY: number): boolean {
            let nextX: number = Math.round(this.translator.mtxLocal.translation.x) + _dirX;
            let nextY: number = Math.round(this.translator.mtxLocal.translation.y) + _dirY;
            let tempTile: ƒ.Node = this.grid.getChildren()[nextY].getChildren()[nextX];
            let tempMat: ƒ.ComponentMaterial = <ƒ.ComponentMaterial>tempTile.getAllComponents()[0];
            if (tempMat.clrPrimary.b == 0) {
                return true;
            }
            return false;
        }
    }
}