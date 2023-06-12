namespace Raserei {
    import ƒ = FudgeCore;
    export class Smoke {
        private smokeNode: ƒ.Node;
        private smokeCloudNode: ƒ.Node;
        static smokeCloudID: string;
        private smokeCloudInstance: ƒ.GraphInstance;
        private rotation: ƒ.Vector3;
        private size: number;
        private riseDir: ƒ.Vector3;
        private age: number = 0;
        private maxAge: number = 0;

        constructor(_pos: ƒ.Vector3, _smokeNode: ƒ.Node, _config: Config) {
            this.smokeNode = _smokeNode;
            Smoke.smokeCloudID = "Graph|2023-04-12T12:45:10.840Z|70362";
            this.smokeCloudNode = new ƒ.Node("Smoke");
            let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
            this.smokeCloudNode.addComponent(cmpTransform);
            this.addGraphToNode(this.smokeCloudNode, Smoke.smokeCloudID);
            this.smokeCloudNode.mtxLocal.translation = _pos;
            this.smokeNode.addChild(this.smokeCloudNode);
            this.rotation = new ƒ.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            this.size = ((Math.random() * 0.1) + 0.5);
            this.riseDir = new ƒ.Vector3(_pos.x, _pos.y, _pos.z);
            this.riseDir.normalize(1);
            this.maxAge = _config.smokeAge - (Math.random() * (_config.smokeAge / 2));
        }

        public update(_f: number): boolean {
            _f = _f * 0.1;
            this.smokeCloudInstance.mtxLocal.translate(ƒ.Vector3.SCALE(this.riseDir, 0.003 * _f));
            this.smokeCloudInstance.getComponent(ƒ.ComponentMesh).mtxPivot.scaling = ƒ.Vector3.ONE(this.size);
            this.smokeCloudInstance.getComponent(ƒ.ComponentMesh).mtxPivot.rotate(ƒ.Vector3.SCALE(this.rotation, _f * 2));
            this.size += 0.01 * _f;
            this.age += _f;
            let color: ƒ.Color = this.smokeCloudInstance.getComponent(ƒ.ComponentMaterial).clrPrimary;
            color.setNormRGBA(1, 1, 1, 1 - Math.pow(this.age / this.maxAge, 8));
            if (this.age > this.maxAge) {
                return true;
            }
            return false;
        }

        public removeNode(): void {
            this.smokeNode.removeChild(this.smokeCloudNode);
        }

        private async addGraphToNode(_node: ƒ.Node, _id: string) {
            const graph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id] as ƒ.Graph);
            this.smokeCloudInstance = graph;
            _node.addChild(graph);
        }

    }
}