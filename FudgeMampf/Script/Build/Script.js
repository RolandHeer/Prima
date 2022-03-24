"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let graph;
    let mrFudge;
    let speed = 1 / 20;
    let translation = new ƒ.Vector3(0, 0, 0);
    let corrector = new ƒ.Vector3(0, 0, 0);
    let lastKey;
    //let gridWidth: number = 5;
    //let gridHeight: number = 5;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        graph = viewport.getBranch();
        mrFudge = graph.getChildrenByName("MrFudge")[0];
        mrFudge.mtxLocal.translation.x = 3;
        console.log("iks: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
        setupGrid();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        updateMrFudge();
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function updateMrFudge() {
        updateDirection();
        updateTranslation();
        //switch(ƒ.Keyboard.isPressedOne)
        mrFudge.mtxLocal.translate(translation);
    }
    function updateDirection() {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D])) {
            lastKey = ƒ.KEYBOARD_CODE.ARROW_RIGHT;
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])) {
            lastKey = ƒ.KEYBOARD_CODE.ARROW_LEFT;
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])) {
            lastKey = ƒ.KEYBOARD_CODE.ARROW_UP;
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])) {
            lastKey = ƒ.KEYBOARD_CODE.ARROW_DOWN;
        }
    }
    function updateTranslation() {
        switch (lastKey) {
            case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                if (mrFudge.mtxLocal.translation.y % 1 < 0.05) {
                    mrFudge.mtxLocal.translation.set(mrFudge.mtxLocal.translation.x, Math.round(mrFudge.mtxLocal.translation.y), 0);
                    console.log("x: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
                    translation.set(speed, 0, 0);
                }
                break;
            case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                if (mrFudge.mtxLocal.translation.y % 1 < 0.05) {
                    mrFudge.mtxLocal.translation.set(mrFudge.mtxLocal.translation.x, Math.round(mrFudge.mtxLocal.translation.y), 0);
                    console.log("x: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
                    translation.set(-speed, 0, 0);
                }
                break;
            case ƒ.KEYBOARD_CODE.ARROW_UP:
                if (mrFudge.mtxLocal.translation.x % 1 < 0.05) {
                    mrFudge.mtxLocal.translation.set(Math.round(mrFudge.mtxLocal.translation.x), mrFudge.mtxLocal.translation.y, 0);
                    console.log("x: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
                    translation.set(0, speed, 0);
                }
                break;
            case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                if (mrFudge.mtxLocal.translation.x % 1 < 0.05) {
                    mrFudge.mtxLocal.translation.set(Math.round(mrFudge.mtxLocal.translation.x), mrFudge.mtxLocal.translation.y, 0);
                    console.log("x: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
                    translation.set(0, -speed, 0);
                }
                break;
            default:
                console.log("bei der Translationszuweisung geschehen seltsame Dinge");
        }
    }
    function setupGrid() {
        /*
        let grid: ƒ.Node = graph.getChildrenByName("Grid")[0];
    
        for (let i: number = 0; i < gridHeight; i++) {
          let tempRow: ƒ.Node = new ƒ.Node("Row" + i);
          for (let j: number = 0; j < gridWidth; j++) {
            let tempQuad: ƒ.ComponentMesh = <ƒ.ComponentMesh> new ƒ.MeshQuad("quad" + j);
            tempRow.attach(tempQuad);
          }
          graph.appendChild(tempRow);
        }
        */
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map