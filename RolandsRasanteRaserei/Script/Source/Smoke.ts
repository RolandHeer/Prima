namespace Raserei{
    import ƒ = FudgeCore;
    export class Smoke {
        private smokeNode: ƒ.Node;
        static smokeCloudID: string;
        private smokeCloudInstance: ƒ.GraphInstance;
        private size: number;
        
        constructor(_pos: ƒ.Vector3, _size: number, _smokeNode: ƒ.Node){
            this.size = _size;
            this.smokeNode = _smokeNode;
            Smoke.smokeCloudID = "Graph|2023-02-28T00:53:28.192Z|47604";
            let tempSmokeNode: ƒ.Node = new ƒ.Node("Smoke");
            let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
            tempSmokeNode.addComponent(cmpTransform);
            this.addGraphToNode(tempSmokeNode, Smoke.smokeCloudID);
            tempSmokeNode.mtxLocal.translation = _pos;
            this.smokeNode.addChild(tempSmokeNode);
        }

        private async addGraphToNode(_node: ƒ.Node, _id: string) {
            const graph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id] as ƒ.Graph);
            this.smokeCloudInstance = graph;
            _node.addChild(graph);
        }
    }
}