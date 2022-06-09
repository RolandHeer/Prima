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
    interface Config {
        fontHeight: number;
        margin: number;
        maxSpeed: number;
        accelSpeed: number;
        maxTurn: number;
        accelTurn: number;
        camDelay: number;
        [key: string]: number | string | Config;
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
        private mtxCar;
        private ctrlDrive;
        private ctrlTurn;
        private currentSpeed;
        private gaz;
        private posArray;
        private oldDrive;
        constructor(_config: Config, _car: ƒ.Node);
        update(): void;
        getCamPos(): ƒ.Vector3;
        getSpeedPercent(): number;
        getGazPercent(): number;
        private updateDriving;
        private updateTurning;
        private updateYawTilt;
        private updateGaz;
        private updatePosArray;
        private setupControls;
    }
}
