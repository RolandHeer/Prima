namespace Endabgabe {
    import ƒ = FudgeCore;

    export class World {
        private config: Config;
        private coins: ƒ.Node;
        static coinGraphID: string;
        private cans: ƒ.Node;
        static canGraphID: string;

        constructor(_config: Config, _world: ƒ.Node) {
            this.config = _config;
            this.coins = _world.getChildrenByName("Collectables")[0].getChildrenByName("Coins")[0];
            World.coinGraphID = "Graph|2022-06-11T00:20:48.515Z|71676";
            this.cans = _world.getChildrenByName("Collectables")[0].getChildrenByName("Cans")[0];
            World.canGraphID = "Graph|2022-06-10T22:51:14.617Z|07901";
            this.generateCoins(this.config.maxCoinCluster, 10);
            this.generateCans(this.config.maxCans);
        }

        public update(): void {
            for (let i: number = 0; i < this.coins.getChildren().length; i++) {
                if (this.coins.getChildren()[i].getChildren().length == 0) {
                    this.coins.removeChild(this.coins.getChildren()[i]);
                    this.generateCoins(1, 10);
                }
            }
            if (this.cans.getChildren().length -1 < this.config.maxCans){
                this.generateCans(1);
            }
        }

        private generateCoins(_clusterCount: number, _clusterSize: number): void {
            for (let j: number = 0; j < _clusterCount; j++) {
                let tempCluster: ƒ.Node = new ƒ.Node("Cluster" + j);
                let pos: ƒ.Vector3 = new ƒ.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                for (let i: number = 0; i < _clusterSize; i++) {
                    let tempPos: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(pos.x + Math.random() * 0.1, pos.y + Math.random() * 0.1, pos.z + Math.random() * 0.1), 50.5);
                    let tempCoinNode: ƒ.Node = new ƒ.Node("Coin" + i);
                    let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                    tempCoinNode.addComponent(cmpTransform);
                    this.addGraphToNode(tempCoinNode, World.coinGraphID);
                    tempCoinNode.mtxLocal.translation = tempPos;
                    tempCoinNode.mtxLocal.lookAt(new ƒ.Vector3(0, 0, 0));
                    tempCoinNode.mtxLocal.rotateX(-90);
                    tempCluster.addChild(tempCoinNode);
                }
                this.coins.addChild(tempCluster);
            }
        }

        private generateCans(_canCount: number): void {
            for (let i: number = 0; i < _canCount; i++) {
                let tempPos: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1), 50.2);
                let tempCanNode: ƒ.Node = new ƒ.Node("Can" + i);
                let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                tempCanNode.addComponent(cmpTransform);
                this.addGraphToNode(tempCanNode, World.canGraphID);
                tempCanNode.mtxLocal.translation = tempPos;
                tempCanNode.mtxLocal.lookAt(new ƒ.Vector3(0, 0, 0));
                tempCanNode.mtxLocal.rotateX(-90);
                this.cans.addChild(tempCanNode);
            }
        }

        private async addGraphToNode(_node: ƒ.Node, _id: string) {
            const graph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id] as ƒ.Graph);
            _node.addChild(graph);
        }
    }
}