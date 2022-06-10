namespace Endabgabe {
    import ƒ = FudgeCore;

    export class World {
        private config: Config;
        private coins: ƒ.Node;
        private coinGraph: ƒ.Node;
        private cans: ƒ.Node;
        private canGraph: ƒ.Node

        constructor(_config: Config, _world: ƒ.Node) {
            this.config = _config;
            this.coins = _world.getChildrenByName("Collectables")[0].getChildrenByName("Coins")[0];
            this.cans = _world.getChildrenByName("Collectables")[0].getChildrenByName("Cans")[0];
            //this.canGraph = 
            this.generateCoins();
            this.generateCans();
        }

        private generateCoins(): void{

        }

        private generateCans(): void{
            for(let i: number = 0; i < this.config.maxCans; i++){
                //this.cans.addChild()
            }
        }
    }
}