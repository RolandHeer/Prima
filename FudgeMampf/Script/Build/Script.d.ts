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
        constructor(_node: ƒ.Node);
        private setup;
    }
}
declare namespace Script {
}
declare namespace Script {
    class MrFudge {
        constructor();
    }
}
