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
                    //console.log(this.node.getAncestor().getChildren()[0].getChildren()[0]);
                    //this.node.mtxLocal.translateY(0);
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
    /// GAME HIRARCHIE \\\
    let config;
    let canvas;
    let crc2;
    let graph;
    let viewport;
    let avatar;
    let camera;
    let cmpCamera;
    let cmpRigidAvatar;
    let cmpTerrain;
    let terrain;
    let torch;
    let heightRef;
    /// AVATAR CONTROLS \\\
    let speedRotX = 0.3;
    let speedRotY = -0.3;
    let walkSpeed = 0.14;
    let ctrlWalk = new ƒ.Control("cntrlWalk", walkSpeed, 0 /* PROPORTIONAL */);
    ctrlWalk.setDelay(70);
    let strafeSpeed = 0.05;
    let ctrlStrafe = new ƒ.Control("cntrlStrafe", strafeSpeed, 0 /* PROPORTIONAL */);
    ctrlStrafe.setDelay(70);
    let rotX = 0;
    let rotY = 0;
    ///     BOOLEAN     \\\
    let lockMode = false;
    let torchOn = true;
    ///      VALUES      \\\
    let terrainX = 60; //Size of Terrain in meter
    let terrainZ = 60;
    let gridRows = 16; //Number of Rows
    let gridColumns = 10; //Number of Columns
    let maxGridOffset = 4; //Offset of Trees in meter
    let avatarHeight = 1.7; //Height of Avatar in meter
    let maxStamina; //Max ammount of time the avatar can run before having to catch his breath
    let maxBatterylife = 5000; //Batterylife of Torch in  millisec.
    let recoveryFactor = 0.3;
    ///        VUI        \\\
    let margin = 70;
    let barheight = 20;
    let barlength = 200;
    let batteryWidth = 50;
    ///       Stats       \\\
    let stamina;
    let batterylife = maxBatterylife; //Batterylife of Torch in  millisec.
    let pages = 0; //number of collected Pages in numbers... lol
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
    async function startInteractiveViewport() {
        // load resources referenced in the link-tag
        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        // pick the graph to show
        let graph = FudgeCore.Project.resources["Graph|2022-04-14T12:56:54.125Z|64295"];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new FudgeCore.ComponentCamera();
        cmpTerrain = graph.getChildren()[0].getChildrenByName("Terrain")[0].getComponent(ƒ.ComponentMesh);
        terrain = cmpTerrain.mesh;
        canvas = document.querySelector("canvas");
        let viewport = new FudgeCore.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        canvas.addEventListener("mousedown", enterPointerLock);
        window.addEventListener("keydown", hndKeydown);
        graph.addEventListener("toggleTorch", hndToggleTorch);
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    async function start(_event) {
        let response = await fetch("config.json");
        config = await response.json();
        initValues();
        setupAvatar(_event);
        createForest();
        setupAudio();
        console.log(config);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        walkController();
        updateTorch();
        viewport.draw();
        drawVUI();
        ƒ.AudioManager.default.update();
    }
    function walkController() {
        let inputWalk = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
        ctrlWalk.setInput(inputWalk);
        let inputStrafe = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
        ctrlStrafe.setInput(inputStrafe);
        let speedMultiplier = 1;
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT])) {
            speedMultiplier = 2;
            stamina--;
            if (stamina < 0) {
                stamina = 0;
                speedMultiplier = 1;
            }
        }
        else {
            stamina += recoveryFactor;
            if (stamina > maxStamina) {
                stamina = maxStamina;
            }
        }
        if (inputWalk > 0) {
            ctrlStrafe.setFactor(strafeSpeed * 0.75 * speedMultiplier);
        }
        else if (inputWalk < 0) {
            ctrlStrafe.setFactor(strafeSpeed * 0.3 * speedMultiplier);
        }
        else {
            ctrlStrafe.setFactor(strafeSpeed * speedMultiplier);
        }
        if (inputStrafe != 0) {
            ctrlWalk.setFactor(walkSpeed * 0.75 * speedMultiplier);
        }
        else {
            ctrlWalk.setFactor(walkSpeed * speedMultiplier);
        }
        if (inputWalk < 0) {
            ctrlWalk.setFactor(walkSpeed * 0.4 * speedMultiplier);
        }
        let tempVector = new ƒ.Vector3(ctrlStrafe.getOutput() * ƒ.Loop.timeFrameGame, 0, ctrlWalk.getOutput() * ƒ.Loop.timeFrameGame);
        tempVector.transform(avatar.mtxLocal, false);
        avatar.getComponent(ƒ.ComponentRigidbody).setVelocity(tempVector);
        cmpRigidAvatar.translateBody(ƒ.Vector3.Y(-getDistanceToTerrain(cmpRigidAvatar.getPosition()) + (avatarHeight / 2)));
        ///   Alte Variante   \\\
        /*
        let mtxL: ƒ.Matrix4x4 = avatar.mtxLocal;
        let mtxG: ƒ.Matrix4x4 = avatar.mtxWorld;
        mtxL.translateZ(ctrlWalk.getOutput() * ƒ.Loop.timeFrameGame / 1000);
        mtxL.translateX(ctrlStrafe.getOutput() * ƒ.Loop.timeFrameGame / 1000);
        mtxL.translateY(-getDistanceToTerrain(new ƒ.Vector3(mtxG.translation.x, mtxG.translation.y, mtxG.translation.z)));
        */
    }
    function initValues() {
        crc2 = canvas.getContext("2d");
        maxStamina = config.stamina;
        stamina = maxStamina;
    }
    function setupAvatar(_event) {
        viewport = _event.detail;
        graph = viewport.getBranch();
        avatar = viewport.getBranch().getChildrenByName("Avatar")[0];
        cmpRigidAvatar = avatar.getComponent(ƒ.ComponentRigidbody);
        camera = avatar.getChild(0);
        viewport.camera = cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        torch = camera.getChild(0);
        heightRef = graph.getChildrenByName("Environment")[0].getChildrenByName("Buildings")[0];
        heightRef;
        initAnim();
        viewport.getCanvas().addEventListener("pointermove", hndPointerMove);
    }
    function hndPointerMove(_event) {
        if (lockMode) {
            rotY += _event.movementX * speedRotY;
            cmpRigidAvatar.setRotation(ƒ.Vector3.Y(rotY));
            rotX += _event.movementY * speedRotX;
            rotX = Math.min(90, Math.max(-90, rotX));
            cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotX);
            torch.mtxLocal.rotation = ƒ.Vector3.X(rotX);
        }
    }
    function enterPointerLock() {
        canvas.requestPointerLock();
        lockMode = true;
    }
    function hndKeydown(_key) {
        switch (_key.code) {
            case "KeyM":
                lockMode = false;
                document.exitPointerLock();
                break;
            case "KeyT":
                toggleTorch();
                break;
        }
    }
    function createForest() {
        let trees = graph.getChildren()[0].getChildrenByName("Trees")[0];
        for (let k = 0; k < 2; k++) {
            for (let j = 0; j < gridRows / 2; j++) {
                for (let i = 0; i < gridColumns; i++) {
                    let tempPos = getRandomHexPosOnTerrain(k, j, i);
                    let rot = Math.random() * 360;
                    let scale = (Math.random() * 0.5) + 0.5;
                    let tempTreeNode = new ƒ.Node("Tree" + i);
                    let comptransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                    tempTreeNode.addComponent(comptransform);
                    addGraphToNode(tempTreeNode, "Graph|2022-04-26T15:21:44.885Z|98189");
                    tempTreeNode.mtxLocal.translation = tempPos;
                    tempTreeNode.mtxLocal.rotateY(rot);
                    tempTreeNode.mtxLocal.scale(new ƒ.Vector3(scale, scale, scale));
                    trees.addChild(tempTreeNode);
                }
            }
        }
    }
    function getRandomHexPosOnTerrain(_k, _x, _z) {
        let offset = new ƒ.Vector2((terrainX / gridRows) * _k, (-terrainZ / (gridColumns * 2)) * _k);
        let random = new ƒ.Vector2(Math.random() * maxGridOffset, Math.random() * maxGridOffset);
        let raster = new ƒ.Vector2(((terrainX / (gridRows / 2)) * _x), ((terrainZ / gridColumns) * _z));
        let tempLoc = new ƒ.Vector3(raster.x + offset.x + random.x - terrainX / 2, 0, raster.y + offset.y + random.y - terrainZ / 2);
        tempLoc.y = -getDistanceToTerrain(tempLoc);
        return tempLoc;
    }
    function getDistanceToTerrain(_loc) {
        let tempDist = terrain.getTerrainInfo(_loc, cmpTerrain.mtxWorld)?.distance;
        if (tempDist) {
            return tempDist;
        }
        return 0;
    }
    async function addGraphToNode(_node, _id) {
        const treeGraph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id]);
        _node.addChild(treeGraph);
    }
    function toggleTorch() {
        if (batterylife > 0) {
            torchOn = !torchOn;
            torch.getComponent(ƒ.ComponentLight).activate(torchOn);
            torch.dispatchEvent(new Event("toggleTorch", { bubbles: true }));
        }
    }
    function updateTorch() {
        if (torchOn) {
            batterylife--;
            if (batterylife < 0) {
                batterylife = 0;
                torchOn = false;
                torch.getComponent(ƒ.ComponentLight).activate(torchOn);
            }
        }
    }
    function hndToggleTorch(_event) {
        console.log(_event);
    }
    function drawVUI() {
        // Stamina
        crc2.fillStyle = "#555";
        crc2.fillRect(margin, canvas.height - barheight - margin, barlength, barheight);
        crc2.fillStyle = "#fff";
        crc2.fillRect(margin, canvas.height - barheight - margin, (stamina / maxStamina) * barlength, barheight);
        // Battery
        crc2.lineWidth = 3;
        crc2.strokeStyle = "#fff";
        crc2.strokeRect(margin, canvas.height - barheight * 3 - margin, batteryWidth, barheight);
        crc2.fillRect(margin + batteryWidth, canvas.height - barheight * 2.666 - margin, 5, barheight / 3);
        crc2.fillRect(margin, canvas.height - barheight * 3 - margin, (batterylife / maxBatterylife) * batteryWidth, barheight);
        //Pages
        crc2.font = barheight + "px Arial";
        crc2.fillText("Pages: " + pages, margin, canvas.height - margin - barheight * 4);
    }
    function setupAudio() {
        //let audioNode: ƒ.Node = graph.getChildrenByName("Sound")[0];
        ƒ.AudioManager.default.listenTo(graph);
    }
    function initAnim() {
        console.log("%cStart over", "color: red;");
        let time0 = 0;
        let time1 = 2000;
        let value0 = 0;
        let value1 = 90;
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(time0, value0));
        animseq.addKey(new ƒ.AnimationKey(time1, value1));
        let animStructure = {
            components: {
                ComponentTransform: [
                    {
                        "ƒ.ComponentTransform": {
                            mtxLocal: {
                                rotation: {
                                    x: animseq,
                                    y: animseq
                                }
                            }
                        }
                    }
                ]
            }
        };
        let fps = 30;
        let animation = new ƒ.Animation("testAnimation", animStructure, fps);
        animation.setEvent("event", 1000);
        animation.labels["jump"] = 500;
        let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
        cmpAnimator.scale = 1;
        cmpAnimator.addEventListener("event", (_event) => {
            let time = _event.target.time;
            console.log(`Event fired at ${time}`, _event);
        });
        if (heightRef.getComponent(ƒ.ComponentAnimator)) {
            heightRef.removeComponent(heightRef.getComponent(ƒ.ComponentAnimator));
        }
        heightRef.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
        console.log("Component", cmpAnimator);
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map