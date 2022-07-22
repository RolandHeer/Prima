namespace Raserei {
    import ƒ = FudgeCore;

    export class World {
        private config: Config;
        private coins: ƒ.Node;
        static coinGraphID: string;
        private cans: ƒ.Node;
        static canGraphID: string;
        private trees: ƒ.Node;
        static treeGraphID: string;
        private doomedCollect: ƒ.GraphInstance[] = [];
        private playerCar: PlayerCar;
        private gameState: GameState;

        constructor(_config: Config, _world: ƒ.Node, _gameState: GameState) {
            this.config = _config;
            this.gameState = _gameState
            this.coins = _world.getChildrenByName("Collectables")[0].getChildrenByName("Coins")[0];
            World.coinGraphID = "Graph|2022-06-11T00:20:48.515Z|71676";
            this.cans = _world.getChildrenByName("Collectables")[0].getChildrenByName("Cans")[0];
            World.canGraphID = "Graph|2022-06-10T22:51:14.617Z|07901";
            this.trees = _world.getChildrenByName("Plants")[0].getChildrenByName("Trees")[0];
            World.treeGraphID = "Graph|2022-07-18T02:17:48.525Z|91815"
            this.generateGraphCluster(World.treeGraphID, this.trees, 5, 5, 0.15, 0.8);
            this.generateGraphCluster(World.coinGraphID, this.coins, this.config.maxCoinCluster, 10, 0.1, 0);
            this.generateCans(this.config.maxCans);
        }

        public update(): void {
            this.spliceDoomed();
        }

        public addToDoomedCollectables(_graph: ƒ.GraphInstance): void {
            this.doomedCollect.push(_graph);
        }

        public setPlayerCar(_car: PlayerCar): void {
            this.playerCar = _car;
        }

        private generateGraphCluster(_graphID: string, _destNode: ƒ.Node, _clusterCount: number, _clusterSize: number, _spread: number, _randomScale: number): void {
            for (let j: number = 0; j < _clusterCount; j++) {
                let tempCluster: ƒ.Node = new ƒ.Node("Cluster" + j);
                let pos: ƒ.Vector3 = new ƒ.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                for (let i: number = 0; i < _clusterSize; i++) {
                    let tempPos: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(pos.x + Math.random() * _spread, pos.y + Math.random() * _spread, pos.z + Math.random() * _spread), 50);
                    let tempNode: ƒ.Node = new ƒ.Node("Graph" + i);
                    let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                    tempNode.addComponent(cmpTransform);
                    this.addGraphToNode(tempNode, _graphID);
                    tempNode.mtxLocal.translation = tempPos;
                    tempNode.mtxLocal.lookAt(new ƒ.Vector3(0, 0, 0));
                    tempNode.mtxLocal.rotateX(-90);
                    tempNode.mtxLocal.rotateY(Math.random() * 360);
                    if (_randomScale > 0) {
                        let r: number = 0.5 + (Math.random() * _randomScale);
                        tempNode.mtxLocal.scale(new ƒ.Vector3(r, r, r));
                    }
                    tempCluster.addChild(tempNode);
                }
                _destNode.addChild(tempCluster);
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

        private spliceDoomed(): void {
            if (this.doomedCollect.length > 0) {
                if (this.doomedCollect[0].idSource == World.coinGraphID) {
                    this.playerCar.incScore();
                    this.gameState.coins += 1;
                    let coinCluster: ƒ.Node = this.doomedCollect[0].getParent().getParent();
                    if (coinCluster.getChildren().length == 1) {
                        coinCluster.getParent().removeChild(coinCluster);
                        this.generateGraphCluster(World.coinGraphID, this.coins, 1, 10, 0.1, 0);
                    } else {
                        coinCluster.removeChild(this.doomedCollect[0].getParent());
                    }
                } else {
                    this.playerCar.fillTank();
                    this.doomedCollect[0].getParent().getParent().removeChild(this.doomedCollect[0].getParent());
                    this.generateCans(1);
                }
                this.doomedCollect.splice(0, 1);
            }
        }

        private async addGraphToNode(_node: ƒ.Node, _id: string) {
            const graph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id] as ƒ.Graph);
            _node.addChild(graph);
        }
    }
}