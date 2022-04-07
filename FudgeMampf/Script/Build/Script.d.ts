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
        constructor(_node: ƒ.Node, _mrFudge: MrFudge);
        private setup;
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
        constructor(_graph: ƒ.Node, _animations: ƒAid.SpriteSheetAnimations, _wakka: ƒ.ComponentAudio);
        update(_key: ƒ.KEYBOARD_CODE): ƒ.KEYBOARD_CODE;
        private move;
        private eatTile;
        private updateDirection;
        private turnIfPossible;
        private updateSprite;
        private updateSound;
        private isPath;
        private isEaten;
        private createSprite;
    }
}
