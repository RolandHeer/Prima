namespace Raserei {
    import ƒ = FudgeCore;

    export class World {
        private config: Config;
        private coins: ƒ.Node;
        static wellGraphID: string;
        private buildings: ƒ.Node;
        static coinGraphID: string;
        private cans: ƒ.Node;
        static canGraphID: string;
        private trees: ƒ.Node;
        static treeGraphIDs: string[] = [];
        static shroomGraphIDs: string[] = [];
        private smoke: ƒ.Node;
        private smokeArray: Smoke[] = [];
        private doomedCollect: ƒ.GraphInstance[] = [];
        private playerCar: PlayerCar;
        private gameState: GameState;

        constructor(_config: Config, _world: ƒ.Node, _gameState: GameState) {
            this.config = _config;
            this.gameState = _gameState
            this.buildings = _world.getChildrenByName("buildings")[0];
            World.wellGraphID = "Graph|2023-04-16T23:04:18.050Z|20649";
            this.coins = _world.getChildrenByName("Collectables")[0].getChildrenByName("Coins")[0];
            World.coinGraphID = "Graph|2022-06-11T00:20:48.515Z|71676";
            this.cans = _world.getChildrenByName("Collectables")[0].getChildrenByName("Cans")[0];
            World.canGraphID = "Graph|2022-06-10T22:51:14.617Z|07901";
            this.trees = _world.getChildrenByName("Plants")[0].getChildrenByName("Trees")[0];
            World.treeGraphIDs.push("Graph|2022-07-18T02:17:48.525Z|91815", "Graph|2023-04-18T21:00:06.441Z|77374");
            World.shroomGraphIDs.push("Graph|2023-04-18T21:42:24.330Z|91738", "Graph|2023-04-18T21:42:27.898Z|43571");
            this.smoke = _world.getChildrenByName("Smoke")[0];
            this.generateWells(3);
            this.generateGraphCluster("trees", this.trees, 5, 5, 0.15, 0.5);
            this.generateGraphCluster("coins", this.coins, this.config.maxCoinCluster, 10, 0.1, 0);
            this.generateCans(this.config.maxCans);
        }

        public update(_f: number): void {
            this.updateSmoke(_f);
            this.spliceDoomedCollectables();
        }

        public addToDoomedCollectables(_graph: ƒ.GraphInstance): void {
            let inStack: boolean = false;
            for (let i: number = 0; i < this.doomedCollect.length; i++) {
                if (_graph == this.doomedCollect[0]) {
                    inStack = true;
                }
            }
            if (!inStack) {
                this.doomedCollect.push(_graph);
            }
        }

        public setPlayerCar(_car: PlayerCar): void {
            this.playerCar = _car;
        }

        public addSmoke(_pos: ƒ.Vector3, _probability: number): void {
            if (Math.random() > _probability && this.smokeArray.length < this.config.maxSmokeAmmount) {
                this.smokeArray.push(new Smoke(_pos, this.smoke, this.config))
            }
        }

        private updateSmoke(_f: number): void {
            for (let i: number = this.smokeArray.length - 1; i >= 0; i--) {
                if (this.smokeArray[i].update(_f)) {
                    this.smokeArray[i].removeNode();
                    this.smokeArray.splice(i, 1);
                }
            }
        }

        private generateWells(_canCount: number): void {
            for (let i: number = 0; i < _canCount; i++) {
                let tempPos: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1), 49.98);
                let tempWellNode: ƒ.Node = new ƒ.Node("Well" + i);
                let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                tempWellNode.addComponent(cmpTransform);
                this.addGraphToNode(tempWellNode, World.wellGraphID);
                tempWellNode.mtxLocal.translation = tempPos;
                tempWellNode.mtxLocal.lookAt(new ƒ.Vector3(0, 0, 0));
                tempWellNode.mtxLocal.rotateX(-90);
                this.cans.addChild(tempWellNode);
            }
        }

        private generateGraphCluster(_type: string, _destNode: ƒ.Node, _clusterCount: number, _clusterSize: number, _spread: number, _randomScale: number): void {
            let _graphID: string;

            for (let j: number = 0; j < _clusterCount; j++) {
                let tempCluster: ƒ.Node = new ƒ.Node("Cluster" + j);
                let pos: ƒ.Vector3 = new ƒ.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                for (let i: number = 0; i < _clusterSize; i++) {
                    let tempPos: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(pos.x + Math.random() * _spread, pos.y + Math.random() * _spread, pos.z + Math.random() * _spread), 50);
                    let tempNode: ƒ.Node = new ƒ.Node("Graph" + i);
                    let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                    tempNode.addComponent(cmpTransform);

                    switch (_type) {
                        case "trees":
                            _graphID = World.treeGraphIDs[Math.round(Math.random())];
                            if (Math.random() > 0.3) {
                                this.addGraphToNode(tempNode, World.shroomGraphIDs[Math.round(Math.random())]);
                            }
                            break;
                        case "coins":
                            _graphID = World.coinGraphID;
                            break;
                        default:
                            console.log("there is no Graphtype called: " + _type);
                    }
                    this.addGraphToNode(tempNode, _graphID);
                    tempNode.mtxLocal.translation = tempPos;
                    tempNode.mtxLocal.lookAt(new ƒ.Vector3(0, 0, 0));
                    tempNode.mtxLocal.rotateX(-90);
                    tempNode.mtxLocal.rotateY(Math.random() * 360);
                    if (_randomScale > 0) {
                        let r: number = 0.8 + (Math.random() * _randomScale);
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

        private spliceDoomedCollectables(): void {
            if (this.doomedCollect.length > 0) {
                if (this.doomedCollect[0].idSource == World.coinGraphID) {
                    this.playerCar.incScore();
                    this.gameState.coins += 1;
                    let coinCluster: ƒ.Node = this.doomedCollect[0].getParent().getParent();
                    if (coinCluster != null && coinCluster.getChildren() != null) {
                        if (coinCluster.getChildren().length == 1 && coinCluster.getParent() != null)  {
                            coinCluster.getParent().removeChild(coinCluster);
                            this.generateGraphCluster("coins", this.coins, 1, 10, 0.1, 0);
                        } else {
                            coinCluster.removeChild(this.doomedCollect[0].getParent());
                        }
                    }
                } else {
                    if (this.playerCar.getScore() - this.config.gasprice >= 0) {
                        this.playerCar.payForGas();
                        this.playerCar.fillTank();
                        this.doomedCollect[0].getParent().getParent().removeChild(this.doomedCollect[0].getParent());
                        this.generateCans(1);
                    }
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