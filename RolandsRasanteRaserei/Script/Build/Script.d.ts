declare namespace Raserei {
    import ƒ = FudgeCore;
    class Cam {
        private viewport;
        private camNode;
        private activeCam;
        private camArray;
        private camRear;
        constructor(_camNode: ƒ.Node, _carBodyNode: ƒ.Node, _viewport: ƒ.Viewport);
        update(_newDestRot: ƒ.Vector3): void;
        toggle(): void;
        reverse(_bool: boolean): void;
    }
}
declare namespace Raserei {
    import ƒ = FudgeCore;
    abstract class Car {
        protected config: Config;
        protected world: World;
        protected carNode: ƒ.Node;
        protected main: ƒ.Node;
        protected body: ƒ.Node;
        protected initTransform: ƒ.Matrix4x4;
        protected initAngles: ƒ.Vector3;
        protected centerRB: ƒ.ComponentRigidbody;
        protected mainRB: ƒ.ComponentRigidbody;
        protected bumperRB: ƒ.ComponentRigidbody;
        protected sphericalJoint: ƒ.JointSpherical;
        protected bumperWeld: ƒ.JointWelding;
        protected mtxTireL: ƒ.Matrix4x4;
        protected mtxTireR: ƒ.Matrix4x4;
        protected engineSoundComponent: ƒ.ComponentAudio;
        protected ctrlTurn: ƒ.Control;
        protected velocity: ƒ.Vector3;
        protected pos: ƒ.Vector3;
        protected gaz: number;
        protected currentSpeed: number;
        protected gripFactor: number;
        protected isPolice: boolean;
        constructor(_carMainNode: ƒ.Node);
        abstract update(_driving: boolean): void;
        getSpeedPercent(): number;
        protected updateDriving(_inputDrive: number): number;
        protected updateTurning(_drive: number, _turnInput: number): void;
        protected pinToGround(): void;
        protected updatePos(): void;
        protected setSpeed(): void;
        protected updateTilt(_drive: number, _turn: number): void;
        protected updateWheels(_turn: number): void;
        protected handleGrip(_forward: number, _relativeZ: ƒ.Vector3, _f: number): void;
        protected updateSmoke(): void;
        protected getRelative2Dvector(_vDir: ƒ.Vector3, _vRot: ƒ.Vector3, _vInitRot: ƒ.Vector3): ƒ.Vector2;
        protected abstract updateGaz(_factor: number): void;
        protected setupControls(_config: Config): void;
        protected getForward(_relativeZ: ƒ.Vector3): number;
        protected evalInputDrive(_inputDrive: number, _forward: number): number;
    }
}
declare namespace Raserei {
    import ƒ = FudgeCore;
    class GameState extends ƒ.Mutable {
        coins: number;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
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
declare namespace Raserei {
    interface Config {
        averageCount: number;
        captureTime: number;
        speedDivider: number;
        turnDivider: number;
        maxTurn: number;
        accelTurn: number;
        fuelConsumption: number;
        camDelay: number;
        maxCoinCluster: number;
        maxCans: number;
        speedometerHeight: number;
        gasprice: number;
        [key: string]: number | string | Config;
    }
    let averageDeltaTime: number;
}
declare namespace Raserei {
    import ƒ = FudgeCore;
    class PlayerCar extends Car {
        private score;
        private camPosArray;
        private engineSound;
        private coinSound;
        private canSound;
        constructor(_config: Config, _carNode: ƒ.Node, _world: World);
        update(_playing: boolean): void;
        incScore(): void;
        payForGas(): void;
        fillTank(): void;
        getCamPos(): ƒ.Vector3;
        getGazPercent(): number;
        isOutOfFuel(): boolean;
        getScore(): number;
        getPosition(): ƒ.Vector3;
        getRotation(): ƒ.Vector3;
        private hndCollision;
        protected updateGaz(_factor: number): void;
        private setupEngineSound;
        private updateCamPosArray;
        private updateEngineSound;
        private setupPlayerCar;
    }
}
declare namespace Raserei {
    import ƒ = FudgeCore;
    class PoliceCar extends Car {
        private player;
        private distPlayer;
        private countdown;
        private counting;
        private sirenSoundComponent;
        gottchaEvent: CustomEvent;
        constructor(_config: Config, _carNode: ƒ.Node, _player: PlayerCar);
        update(_playing: boolean): void;
        hasHim(): boolean;
        isCounting(): boolean;
        getCountdown(): number;
        protected updateGaz(_factor: number): void;
        private updateCountdown;
        private hndCollision;
        private getDir;
        private evalDir;
        private setupPoliceCar;
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
declare namespace Raserei {
    import ƒ = FudgeCore;
    class Smoke {
        private smokeNode;
        static smokeCloudID: string;
        private smokeCloudInstance;
        private size;
        constructor(_pos: ƒ.Vector3, _size: number, _smokeNode: ƒ.Node);
        private addGraphToNode;
    }
}
declare namespace Raserei {
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
declare namespace Raserei {
    import ƒ = FudgeCore;
    class World {
        private config;
        private coins;
        static coinGraphID: string;
        private cans;
        static canGraphID: string;
        private trees;
        static treeGraphID: string;
        private smoke;
        private doomedCollect;
        private playerCar;
        private gameState;
        constructor(_config: Config, _world: ƒ.Node, _gameState: GameState);
        update(): void;
        addToDoomedCollectables(_graph: ƒ.GraphInstance): void;
        setPlayerCar(_car: PlayerCar): void;
        private generateGraphCluster;
        private generateCans;
        private spliceDoomed;
        private addGraphToNode;
    }
}
