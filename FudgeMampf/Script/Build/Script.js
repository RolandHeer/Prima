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
    class Ghost {
        //private mrFudge: MrFudge;
        constructor(_node, _mrFudge) {
            this.setup(_node);
            //this.mrFudge = _mrFudge;
        }
        setup(_node) {
            let tempMaterial = new ƒ.Material("ghostMat", ƒ.ShaderLit);
            let tempMesh = new ƒ.MeshSphere("ghostSphere", 6, 6);
            let tempMaterialComp = new ƒ.ComponentMaterial(tempMaterial);
            tempMaterialComp.clrPrimary = ƒ.Color.CSS("#ed0043");
            let tempMeshComp = new ƒ.ComponentMesh(tempMesh);
            tempMeshComp.mtxPivot.scale(new ƒ.Vector3(0.8, 0.8, 0.8));
            let tempTransformComp = new ƒ.ComponentTransform();
            _node.addComponent(tempTransformComp);
            _node.addComponent(tempMaterialComp);
            _node.addComponent(tempMeshComp);
            _node.mtxLocal.translation = new ƒ.Vector3(5, 5, 0);
        }
    }
    Script.Ghost = Ghost;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let graph;
    let lastKey = ƒ.KEYBOARD_CODE.ESC; //Default Value
    let introSound;
    let wakkaSound;
    let ghosts = [];
    let mrFudge;
    let animations;
    let gridWidth = 7;
    let gridHeight = 7;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    let dialog;
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
            dialog.close();
            startInteractiveViewport();
        });
        //@ts-ignore
        dialog.showModal();
    }
    // setup and start interactive viewport
    async function startInteractiveViewport() {
        // load resources referenced in the link-tag
        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        // pick the graph to show
        let graph = FudgeCore.Project.resources["Graph|2022-04-07T17:26:03.173Z|68881"];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new FudgeCore.ComponentCamera();
        let canvas = document.querySelector("canvas");
        let viewport = new FudgeCore.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        await loadSprite();
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    function start(_event) {
        setupViewport(_event);
        graph = viewport.getBranch();
        setupAudio();
        setupGrid();
        //createSprite();
        mrFudge = new Script.MrFudge(graph, animations, wakkaSound);
        createGhosts(1);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        updateLastKey();
        lastKey = mrFudge.update(lastKey);
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function updateLastKey() {
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
    async function loadSprite() {
        let imgSpriteSheet = new ƒ.TextureImage();
        await imgSpriteSheet.load("img/sprite.png");
        let spriteSheet = new ƒ.CoatTextured(undefined, imgSpriteSheet);
        generateSprite(spriteSheet);
    }
    function generateSprite(_spritesheet) {
        animations = {};
        let spriteName = "mrFudge";
        let tempSprite = new ƒAid.SpriteSheetAnimation(spriteName, _spritesheet);
        tempSprite.generateByGrid(ƒ.Rectangle.GET(0, 0, 64, 64), 8, 70, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(64));
        animations[spriteName] = tempSprite;
    }
    function createGhosts(_count) {
        for (let i = 0; i < _count; i++) {
            let tempNode = new ƒ.Node("ghostNr" + i);
            graph.addChild(tempNode);
            let tempGhost = new Script.Ghost(tempNode, mrFudge);
            ghosts.push(tempGhost);
        }
    }
    function setupViewport(_event) {
        viewport = _event.detail;
        viewport.camera.mtxPivot.translate(new ƒ.Vector3(Math.floor(gridWidth / 2), Math.floor(gridHeight / 2), gridHeight * 1.7));
        viewport.camera.mtxPivot.rotateY(180, false);
    }
    function setupAudio() {
        let audioNode = graph.getChildrenByName("Sound")[0];
        introSound = audioNode.getAllComponents()[1];
        introSound.play(true);
        wakkaSound = audioNode.getAllComponents()[2];
        ƒ.AudioManager.default.listenTo(graph);
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
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    class MrFudge {
        grid;
        translator;
        rotator;
        speed = 1 / 20;
        velocity = new ƒ.Vector3(0, 0, 0);
        threshold = 0.1;
        sprite;
        spriteReverse = false;
        wakka;
        score = 0;
        constructor(_graph, _animations, _wakka) {
            this.grid = _graph.getChildrenByName("Grid")[0];
            this.translator = _graph.getChildrenByName("MrFudge")[0];
            this.rotator = this.translator.getChildrenByName("rotation")[0];
            this.createSprite(_animations);
            this.wakka = _wakka;
        }
        update(_key) {
            let tempKey;
            tempKey = this.updateDirection(_key);
            this.updateSprite();
            this.updateSound();
            this.move();
            return tempKey;
        }
        move() {
            let tempPos = this.translator.mtxLocal.translation;
            if ((tempPos.y % 1) + this.threshold / 2 < this.threshold && (tempPos.x % 1) + this.threshold / 2 < this.threshold) { //schaut ob sich Mr.Fudge auf einem Knotenpunkt befindet
                let fudgeTilePos = new ƒ.Vector2(Math.round(tempPos.x), Math.round(tempPos.y));
                if (!this.isEaten(fudgeTilePos)) {
                    this.eatTile(fudgeTilePos);
                }
                if (this.isPath(Math.round(this.velocity.x / this.speed), Math.round(this.velocity.y / this.speed))) { //schaut ob das kommende Tile eine Wand ist
                    this.translator.mtxLocal.translate(this.velocity);
                }
                else {
                    tempPos = new ƒ.Vector3(Math.round(tempPos.x), Math.round(tempPos.y), 0); //setzt Mr. Fudge auf die Mitte des Tiles
                    this.velocity.set(0, 0, 0);
                }
            }
            else {
                this.translator.mtxLocal.translate(this.velocity);
            }
        }
        eatTile(_pos) {
            let tempTile = this.grid.getChildren()[_pos.y].getChildren()[_pos.x];
            let tempMat = tempTile.getAllComponents()[0];
            tempMat.clrPrimary.setHex("000000");
            this.score++;
            console.log(this.score);
        }
        updateDirection(_key) {
            let tempKey = _key;
            switch (tempKey) {
                case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                    tempKey = this.turnIfPossible(_key, 1, 0);
                    if (tempKey == ƒ.KEYBOARD_CODE.ESC) {
                        this.rotator.mtxLocal.rotation = new ƒ.Vector3(0, 0, 0);
                    }
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                    tempKey = this.turnIfPossible(_key, -1, 0);
                    if (tempKey == ƒ.KEYBOARD_CODE.ESC) {
                        this.rotator.mtxLocal.rotation = new ƒ.Vector3(0, 180, 0);
                    }
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    tempKey = this.turnIfPossible(_key, 0, 1);
                    if (tempKey == ƒ.KEYBOARD_CODE.ESC) {
                        this.rotator.mtxLocal.rotation = new ƒ.Vector3(0, 0, 90);
                    }
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    tempKey = this.turnIfPossible(_key, 0, -1);
                    if (tempKey == ƒ.KEYBOARD_CODE.ESC) {
                        this.rotator.mtxLocal.rotation = new ƒ.Vector3(0, 0, -90);
                    }
                    break;
                case ƒ.KEYBOARD_CODE.ESC:
                    break;
                default:
                    console.log("bei der Translationszuweisung geschehen seltsame Dinge");
            }
            return tempKey;
        }
        turnIfPossible(_tempKey, _x, _y) {
            let tempPos = this.translator.mtxLocal.translation;
            let t = this.threshold;
            if (((tempPos.x % 1) + t / 2 < t && Math.abs(_y) > 0) || ((tempPos.y % 1) + t / 2 < t && Math.abs(_x) > 0)) {
                if (this.isPath(_x, _y)) {
                    if (Math.abs(_x)) {
                        tempPos = new ƒ.Vector3(tempPos.x, Math.round(tempPos.y), 0);
                    }
                    else {
                        tempPos = new ƒ.Vector3(Math.round(tempPos.x), tempPos.y, 0);
                    }
                    this.velocity.set(this.speed * _x, this.speed * _y, 0);
                    _tempKey = ƒ.KEYBOARD_CODE.ESC;
                }
            }
            return _tempKey;
        }
        updateSprite() {
            if (this.sprite.getCurrentFrame == 7 && !this.spriteReverse) {
                this.sprite.setFrameDirection(-1);
                this.spriteReverse = true;
            }
            else if (this.sprite.getCurrentFrame == 0 && this.spriteReverse) {
                this.sprite.setFrameDirection(1);
                this.spriteReverse = false;
            }
        }
        updateSound() {
            if (this.velocity.x == 0 && this.velocity.y == 0) {
                this.wakka.volume = 0;
            }
            else {
                this.wakka.volume = 0.3;
            }
        }
        isPath(_dirX, _dirY) {
            let nextX = Math.round(this.translator.mtxLocal.translation.x) + _dirX;
            let nextY = Math.round(this.translator.mtxLocal.translation.y) + _dirY;
            let tempTile = this.grid.getChildren()[nextY].getChildren()[nextX];
            let tempMat = tempTile.getAllComponents()[0];
            if (tempMat.clrPrimary.b == 0) {
                return true;
            }
            return false;
        }
        isEaten(_pos) {
            let tempTile = this.grid.getChildren()[_pos.y].getChildren()[_pos.x];
            let tempMat = tempTile.getAllComponents()[0];
            if (tempMat.clrPrimary.g == 0) {
                return true;
            }
            return false;
        }
        createSprite(_animations) {
            this.sprite = new ƒAid.NodeSprite("Sprite");
            this.sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            this.sprite.setAnimation(_animations["mrFudge"]);
            this.sprite.setFrameDirection(1);
            this.sprite.mtxLocal.translateZ(0.1);
            this.sprite.framerate = 60;
            this.rotator.addChild(this.sprite);
            this.rotator.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        }
    }
    Script.MrFudge = MrFudge;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map