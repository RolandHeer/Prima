declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Endabgabe {
}
declare namespace Endabgabe {
    import ƒ = FudgeCore;
    interface Config {
        fontHeight: number;
        margin: number;
        maxSpeed: number;
        accelSpeed: number;
        maxTurn: number;
        accelTurn: number;
        [key: string]: number | string | Config;
    }
    export class Car {
        private config;
        private car;
        private chassis;
        private rigidBody;
        private mtxCar;
        private ctrlDrive;
        private ctrlTurn;
        private currentSpeed;
        private gaz;
        constructor(_config: Config, _car: ƒ.Node);
        update(): void;
        getSpeedPercent(): number;
        getGazPercent(): number;
        private updateDriving;
        private updateTurning;
        private updateGaz;
        private setupControls;
    }
    export {};
}
