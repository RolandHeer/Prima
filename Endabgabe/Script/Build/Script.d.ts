declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        private rigid;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Endabgabe {
    interface Config {
        fontHeight: number;
        margin: number;
        maxSpeed: number;
        accelSpeed: number;
        maxTurn: number;
        accelTurn: number;
        camDelay: number;
        maxCans: number;
        [key: string]: number | string | Config;
    }
}
declare namespace Endabgabe {
    import ƒ = FudgeCore;
    class World {
        private config;
        private coins;
        private coinGraph;
        private cans;
        private canGraph;
        constructor(_config: Config, _world: ƒ.Node);
        private generateCoins;
        private generateCans;
    }
}
declare namespace Endabgabe {
    import ƒ = FudgeCore;
    class Cam {
        private camNode;
        constructor(_camNode: ƒ.Node);
        update(_newPos: ƒ.Vector3): void;
    }
}
declare namespace Endabgabe {
    import ƒ = FudgeCore;
    class Car {
        private config;
        private car;
        private chassis;
        private rigidBody;
        private mtxTireL;
        private mtxTireR;
        private ctrlDrive;
        private ctrlTurn;
        private currentSpeed;
        private gaz;
        private posArray;
        constructor(_config: Config, _car: ƒ.Node);
        update(): void;
        getCamPos(): ƒ.Vector3;
        getSpeedPercent(): number;
        getGazPercent(): number;
        private updateDriving;
        private updateTurning;
        private updateYawTilt;
        private updateWheels;
        private updateGaz;
        private updatePosArray;
        private setupControls;
    }
}
