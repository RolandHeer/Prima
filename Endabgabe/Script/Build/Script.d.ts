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
    abstract class Car {
        protected config: Config;
        protected carNode: ƒ.Node;
        protected main: ƒ.Node;
        protected body: ƒ.Node;
        protected centerRB: ƒ.ComponentRigidbody;
        protected mainRB: ƒ.ComponentRigidbody;
        protected sphericalJoint: ƒ.JointSpherical;
        protected mtxTireL: ƒ.Matrix4x4;
        protected mtxTireR: ƒ.Matrix4x4;
        protected ctrlDrive: ƒ.Control;
        protected ctrlTurn: ƒ.Control;
        protected wasTurning: boolean;
        protected factor: number;
        abstract update(): void;
        protected abstract updateDriving(_inputDrive: number): number;
        protected updateTurning(_drive: number, _turnInput: number): void;
        protected updateTilt(_drive: number, _turn: number): void;
        protected updateWheels(_turn: number): void;
        protected setupControls(_config: Config): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class GravityScript extends ƒ.ComponentScript {
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
        pMaxSpeed: number;
        pAccelSpeed: number;
        maxTurn: number;
        accelTurn: number;
        camDelay: number;
        maxCoinCluster: number;
        maxCans: number;
        [key: string]: number | string | Config;
    }
}
declare namespace Endabgabe {
    import ƒ = FudgeCore;
    class PlayerCar extends Car {
        private currentSpeed;
        private gaz;
        private score;
        private posArray;
        constructor(_config: Config, _car: ƒ.Node);
        update(): void;
        getCamPos(): ƒ.Vector3;
        getSpeedPercent(): number;
        getGazPercent(): number;
        getScore(): number;
        getPosition(): ƒ.Vector3;
        protected updateDriving(): number;
        private hndCollision;
        private updateGaz;
        private updatePosArray;
    }
}
declare namespace Endabgabe {
    import ƒ = FudgeCore;
    class PoliceCar extends Car {
        private player;
        private policeNode;
        constructor(_config: Config, _carNode: ƒ.Node, _player: PlayerCar);
        update(): void;
        protected updateDriving(_inputDrive: number): number;
        private getDir;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class RotationScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        private mtx;
        private rotationSpeed;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Endabgabe {
    class Vector {
        x: number;
        y: number;
        length: number;
        constructor(_x: number, _y: number);
        static getRandom(_min: number, _max: number): Vector;
        static getDifference(_v0: Vector, _v1: Vector): Vector;
        static getSum(_v0: Vector, _v1: Vector): Vector;
        static getScaled(_v: Vector, _scale: number): Vector;
        static getLength(_vector: Vector): number;
        static getuberVector(_length: number, _direction: Vector): Vector;
        static getRotVector(_length: number, _rot: number): Vector;
        static getRotOfVector(_vector: Vector): number;
        static getRotOfXY(_x: number, _y: number): number;
        set(_x: number, _y: number): void;
        add(_addend: Vector): void;
        clone(): Vector;
        private calcLength;
    }
}
declare namespace Endabgabe {
    import ƒ = FudgeCore;
    class World {
        private config;
        private coins;
        static coinGraphID: string;
        private cans;
        static canGraphID: string;
        constructor(_config: Config, _world: ƒ.Node);
        update(): void;
        private generateCoins;
        private generateCans;
        private addGraphToNode;
    }
}
