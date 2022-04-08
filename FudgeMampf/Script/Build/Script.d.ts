declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    class Ghost {
        private grid;
        private mrFudge;
        private translator;
        private materialComp;
        private speed;
        private velocity;
        private threshold;
        constructor(_graph: ƒ.Node, _node: ƒ.Node, _mrFudge: MrFudge);
        private setup;
        update(): void;
        private move;
        private setDir;
        private isPath;
    }
}
declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;
    class MrFudge {
        private grid;
        private translator;
        private rotator;
        private speed;
        private velocity;
        private threshold;
        private sprite;
        private spriteReverse;
        private wakka;
        private score;
        private running;
        constructor(_graph: ƒ.Node, _animations: ƒAid.SpriteSheetAnimations, _wakka: ƒ.ComponentAudio);
        update(_key: ƒ.KEYBOARD_CODE): ƒ.KEYBOARD_CODE;
        getPos(): ƒ.Vector2;
        getDir(): ƒ.Vector2;
        private move;
        stop(): void;
        private updateTurn;
        private turnIfPossible;
        private eat;
        private updateSprite;
        private updateSound;
        private isPath;
        private isEaten;
        private createSprite;
    }
}
