"use strict";
var Endabgabe;
(function (Endabgabe) {
    class Cam {
        camNode;
        constructor(_camNode) {
            this.camNode = _camNode;
        }
        update(_newPos) {
            this.camNode.mtxLocal.rotation = _newPos;
        }
    }
    Endabgabe.Cam = Cam;
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    var ƒ = FudgeCore;
    class Car {
        config;
        carNode;
        main;
        body;
        centerRB;
        mainRB;
        sphericalJoint;
        mtxTireL;
        mtxTireR;
        world;
        ctrlDrive;
        ctrlTurn;
        gaz = 100;
        currentSpeed = 0;
        wasTurning;
        factor = 1;
        updateDriving(_inputDrive) {
            if (_inputDrive >= 0) { //Driving Forward
                if (this.gaz == 0) { //Disable Speedup without gaz while still beeing able to break
                    _inputDrive = 0;
                }
            }
            else { //Driving Backward
                if (this.gaz == 0) { //Disable Speedup without gaz while still beeing able to break
                    _inputDrive = 0;
                }
            }
            if (this.wasTurning) {
                _inputDrive = _inputDrive * 0.7;
            }
            this.ctrlDrive.setInput(_inputDrive);
            this.mainRB.applyForce(ƒ.Vector3.SCALE(this.main.mtxLocal.getZ(), _inputDrive * 60));
            this.currentSpeed = this.ctrlDrive.getOutput() * this.factor;
            this.updateGaz(this.ctrlDrive.getOutput()); //ehemals Loop Frame Time
            return this.ctrlDrive.getOutput(); //ehemals Loop Frame Time
        }
        updateTurning(_drive, _turnInput) {
            this.ctrlTurn.setInput(_turnInput);
            if (_drive > 0) {
                this.mainRB.rotateBody(ƒ.Vector3.SCALE(this.main.mtxLocal.getY(), this.ctrlTurn.getOutput() * Math.min(0.3, _drive)));
            }
            else {
                this.mainRB.rotateBody(ƒ.Vector3.SCALE(this.main.mtxLocal.getY(), this.ctrlTurn.getOutput() * Math.min(-0.3, _drive)));
            }
            if (Math.abs(_turnInput) > 0) {
                this.wasTurning = true;
            }
            else {
                this.wasTurning = false;
            }
            this.updateTilt(_drive, this.ctrlTurn.getOutput());
            this.updateWheels(this.ctrlTurn.getOutput());
        }
        pinToGround() {
            this.mainRB.setPosition(ƒ.Vector3.NORMALIZATION(this.mainRB.getPosition(), 50.4)); //setzt den Abstand zur Weltmitte auf genau 50.4 (weltradius 50 plus abstand rigid body);
        }
        updateTilt(_drive, _turn) {
            if (_drive > 0) {
                this.body.mtxLocal.rotation = new ƒ.Vector3(0, 0, (_drive * _turn) * 3);
            }
            else {
                this.body.mtxLocal.rotation = new ƒ.Vector3(0, 0, (-_drive * _turn) * 3);
            }
        }
        updateWheels(_turn) {
            let tempV = new ƒ.Vector3(0, _turn * 4, -_turn * 2);
            this.mtxTireL.rotation = tempV;
            this.mtxTireR.rotation = tempV;
        }
        setupControls(_config) {
            this.ctrlDrive = new ƒ.Control("cntrlDrive", _config.maxSpeed, 0 /* PROPORTIONAL */);
            this.ctrlDrive.setDelay(_config.accelSpeed);
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, 0 /* PROPORTIONAL */);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }
    }
    Endabgabe.Car = Car;
})(Endabgabe || (Endabgabe = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class GravityScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(GravityScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "GravityScript added to ";
        rigid;
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
                    //ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "renderPrepare" /* RENDER_PREPARE */:
                    let v = this.rigid.getPosition();
                    this.rigid.applyForce(ƒ.Vector3.SCALE(v, -0.2));
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    this.rigid = this.node.getComponent(ƒ.ComponentRigidbody);
                    this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.hndEvent);
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.GravityScript = GravityScript;
})(Script || (Script = {}));
var Endabgabe;
(function (Endabgabe) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    /// GAME HIRARCHIE \\\
    let canvas;
    let crc2;
    let graph;
    let viewport;
    let camNode;
    let cameraNode;
    let cameraTranslatorNode;
    let cmpCamera;
    let carNode;
    let policeCarNode;
    ///   GAME MODES   \\\
    let isMenue = true;
    ///     VALUES     \\\
    let config;
    ///     OBJECTS    \\\
    let car;
    let policeCar;
    let cam;
    let world;
    /// RUNTIME VALUES \\\
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
        graph = FudgeCore.Project.resources["Graph|2022-05-18T20:10:05.727Z|72077"];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new FudgeCore.ComponentCamera();
        canvas = document.querySelector("canvas");
        viewport = new FudgeCore.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        canvas.addEventListener("mousedown", enterPointerLock);
        window.addEventListener("keydown", hndKeydown);
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    async function start(_event) {
        let response = await fetch("config.json");
        config = await response.json();
        initValues();
        world = new Endabgabe.World(config, graph.getChildrenByName("World")[0]);
        setupCar();
        setupPolice();
        setupCam();
        setupAudio();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        world.update();
        car.update();
        policeCar.update();
        cam.update(car.getCamPos());
        ƒ.Physics.simulate(); // if physics is included and used
        renderScreen();
    }
    function renderScreen() {
        viewport.draw();
        renderVUI();
    }
    function renderVUI() {
        // Coins
        crc2.fillStyle = "#fff";
        crc2.font = config.fontHeight + "px Arial";
        crc2.fillText("Coins: " + car.getScore(), config.margin, config.margin * 2);
        // Gaz
        crc2.fillText("Gaz: " + Math.round(car.getGazPercent()) + "%", config.margin, config.margin * 4);
        // Speedometer
        crc2.save();
        crc2.resetTransform();
        crc2.translate(canvas.width - 200, canvas.height - 30);
        crc2.rotate((Math.abs(car.getSpeedPercent()) * 180) * Math.PI / 180);
        crc2.fillRect(-100, -5, 105, 10);
        crc2.restore();
    }
    function enterPointerLock() {
        canvas.requestPointerLock();
        isMenue = false;
    }
    function hndKeydown(_key) {
        switch (_key.code) {
            case "KeyM":
                isMenue = true;
                document.exitPointerLock();
                break;
        }
    }
    function initValues() {
        graph = viewport.getBranch();
        crc2 = canvas.getContext("2d");
    }
    function setupCar() {
        carNode = graph.getChildren()[0];
        car = new Endabgabe.PlayerCar(config, carNode, world);
    }
    function setupPolice() {
        policeCarNode = graph.getChildrenByName("Police")[0].getChildrenByName("Cars")[0].getChildren()[0];
        policeCar = new Endabgabe.PoliceCar(config, policeCarNode, car);
    }
    function setupCam() {
        camNode = graph.getChildrenByName("Cam")[0];
        cameraNode = camNode.getChildren()[0].getChildrenByName("Camera")[0];
        cameraTranslatorNode = cameraNode.getChildren()[0];
        viewport.camera = cmpCamera = cameraTranslatorNode.getComponent(ƒ.ComponentCamera);
        //viewport.camera = cmpCamera = carNode.getChildrenByName("Main")[0].getChildrenByName("testcam")[0].getComponent(ƒ.ComponentCamera);
        cam = new Endabgabe.Cam(camNode);
    }
    function setupAudio() {
        //let audioNode: ƒ.Node = graph.getChildrenByName("Sound")[0];
        ƒ.AudioManager.default.listenTo(graph);
    }
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    var ƒ = FudgeCore;
    class PlayerCar extends Endabgabe.Car {
        // Runtime Values 
        score = 0;
        posArray = [];
        constructor(_config, _car, _world) {
            super();
            this.config = _config;
            this.world = _world;
            this.world.setPlayerCar(this);
            this.carNode = _car;
            this.main = _car.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];
            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.carNode.addComponent(this.sphericalJoint);
            this.mainRB.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, this.hndCollision);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }
        update() {
            //console.log("local y: " + Math.round(this.main.mtxLocal.translation.y) + ", world y: " + Math.round(this.main.mtxWorld.translation.y));
            this.updateTurning(this.updateDriving(ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])), ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
            this.pinToGround();
            this.updatePosArray();
            // this.applyRotation();
        }
        incScore() {
            this.score++;
        }
        fillTank() {
            this.gaz = 100;
        }
        getCamPos() {
            return this.posArray[0];
        }
        getSpeedPercent() {
            return this.currentSpeed / this.config.maxSpeed;
        }
        getGazPercent() {
            return this.gaz;
        }
        getScore() {
            return this.score;
        }
        getPosition() {
            return this.main.mtxWorld.translation;
        }
        hndCollision = (_event) => {
            let graph = _event.cmpRigidbody.node;
            if (graph.idSource == Endabgabe.World.coinGraphID || graph.idSource == Endabgabe.World.canGraphID) {
                this.world.addToDoomedCollectables(graph);
            }
        };
        updateGaz(_factor) {
            this.gaz = Math.max(0, this.gaz - 0.05 * Math.abs(_factor));
        }
        updatePosArray() {
            let tempPos = this.main.mtxLocal.getEulerAngles();
            let newPos = new ƒ.Vector3(tempPos.x, tempPos.y, tempPos.z);
            this.posArray.push(newPos);
            if (this.posArray.length > this.config.camDelay) {
                this.posArray.splice(0, 1);
            }
        }
    }
    Endabgabe.PlayerCar = PlayerCar;
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    var ƒ = FudgeCore;
    class PoliceCar extends Endabgabe.Car {
        player;
        policeNode;
        constructor(_config, _carNode, _player) {
            super();
            this.config = _config;
            this.carNode = _carNode;
            this.policeNode = this.carNode.getParent().getParent();
            this.player = _player;
            this.main = _carNode.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];
            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            //this.rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }
        update() {
            let tempDir = this.getDir();
            this.updateTurning(this.updateDriving(tempDir.x), tempDir.y);
            this.pinToGround();
        }
        updateGaz(_factor) {
        }
        getDir() {
            let v1 = this.main.mtxWorld.translation;
            let v2 = this.player.getPosition();
            let vR = ƒ.Vector3.DIFFERENCE(v2, v1);
            vR.normalize();
            let vRot = ƒ.Vector3.SCALE(this.main.mtxLocal.getEulerAngles(), -1);
            let testNode = this.policeNode.getChildrenByName("TestNode")[0];
            let destNode = testNode.getChildren()[0];
            testNode.mtxLocal.rotation = ƒ.Vector3.ZERO();
            destNode.mtxLocal.translation = vR;
            testNode.mtxLocal.rotateX(vRot.x);
            testNode.mtxLocal.rotateY(vRot.y);
            testNode.mtxLocal.rotateZ(vRot.z);
            //console.log("x: " + Math.round(destNode.mtxWorld.translation.x) + ", z: " + Math.round(destNode.mtxWorld.translation.z));
            if (v1.getDistance(v2) > 4 && destNode.mtxWorld.translation.z < 0) {
                return new ƒ.Vector2(destNode.mtxWorld.translation.z, destNode.mtxWorld.translation.x); //um die Polizei logisch fahren zu lassen müsste hier in den "umdrehmodus" gewechselt werden
            }
            else {
                return new ƒ.Vector2(destNode.mtxWorld.translation.z, destNode.mtxWorld.translation.x);
            }
        }
    }
    Endabgabe.PoliceCar = PoliceCar;
})(Endabgabe || (Endabgabe = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class RotationScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(RotationScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "RotationScript added to ";
        mtx;
        rotationSpeed = 4;
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
                    //ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "renderPrepare" /* RENDER_PREPARE */:
                    this.mtx.rotate(ƒ.Vector3.Y(this.rotationSpeed));
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    this.mtx = this.node.getComponent(ƒ.ComponentMesh).mtxPivot;
                    this.mtx.rotate(ƒ.Vector3.Y(Math.random() * 360));
                    this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.hndEvent);
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.RotationScript = RotationScript;
})(Script || (Script = {}));
var Endabgabe;
(function (Endabgabe) {
    class Vector {
        x;
        y;
        length;
        constructor(_x, _y) {
            this.x = _x;
            this.y = _y;
            this.calcLength();
        }
        static getRandom(_min, _max) {
            let tempVector = new Vector(0, 0);
            tempVector.set(_min + Math.random() * (_max - _min), _min + Math.random() * (_max - _min));
            return tempVector;
        }
        static getDifference(_v0, _v1) {
            let tempVector = new Vector(0, 0);
            tempVector.set(_v0.x - _v1.x, _v0.y - _v1.y);
            return tempVector;
        }
        static getSum(_v0, _v1) {
            let tempVector = new Vector(0, 0);
            tempVector.set(_v0.x + _v1.x, _v0.y + _v1.y);
            return tempVector;
        }
        static getScaled(_v, _scale) {
            let tempVector = new Vector(0, 0);
            tempVector.set(_v.x * _scale, _v.y * _scale);
            return tempVector;
        }
        static getLength(_vector) {
            let templength;
            templength = Math.sqrt((_vector.x * _vector.x) + (_vector.y * _vector.y));
            return templength;
        }
        static getuberVector(_length, _direction) {
            let tempVector = new Vector(_direction.x / (_direction.length), _direction.y / (_direction.length));
            tempVector = this.getScaled(tempVector, _length);
            return tempVector;
        }
        static getRotVector(_length, _rot) {
            return this.getuberVector(_length, new Vector(Math.sin(_rot * Math.PI / 180), -Math.cos(_rot * Math.PI / 180)));
        }
        static getRotOfVector(_vector) {
            if (_vector.x < 0) {
                return -(90 - (Math.atan(-_vector.y / -_vector.x) * (180 / Math.PI)));
            }
            else {
                return (Math.atan(-_vector.y / -_vector.x) * (180 / Math.PI)) + 90;
            }
        }
        static getRotOfXY(_x, _y) {
            if (_x < 0) {
                return -(90 - (Math.atan(-_y / -_x) * (180 / Math.PI)));
            }
            else {
                return (Math.atan(-_y / -_x) * (180 / Math.PI)) + 90;
            }
        }
        set(_x, _y) {
            this.x = _x;
            this.y = _y;
            this.calcLength();
        }
        add(_addend) {
            this.x += _addend.x;
            this.y += _addend.y;
            this.calcLength();
        }
        clone() {
            return new Vector(this.x, this.y);
        }
        calcLength() {
            this.length = Math.sqrt((this.x * this.x) + (this.y * this.y));
        }
    }
    Endabgabe.Vector = Vector;
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    var ƒ = FudgeCore;
    class World {
        config;
        coins;
        static coinGraphID;
        cans;
        static canGraphID;
        doomedCollect = [];
        playerCar;
        constructor(_config, _world) {
            this.config = _config;
            this.coins = _world.getChildrenByName("Collectables")[0].getChildrenByName("Coins")[0];
            World.coinGraphID = "Graph|2022-06-11T00:20:48.515Z|71676";
            this.cans = _world.getChildrenByName("Collectables")[0].getChildrenByName("Cans")[0];
            World.canGraphID = "Graph|2022-06-10T22:51:14.617Z|07901";
            this.generateCoins(this.config.maxCoinCluster, 10);
            this.generateCans(this.config.maxCans);
        }
        update() {
            for (let i = 0; i < this.coins.getChildren().length; i++) {
                if (this.coins.getChildren()[i].getChildren().length == 0) {
                    this.coins.removeChild(this.coins.getChildren()[i]);
                    this.generateCoins(1, 10);
                }
            }
            if (this.cans.getChildren().length - 1 < this.config.maxCans) {
                this.generateCans(1);
            }
            this.spliceDoomed();
        }
        addToDoomedCollectables(_graph) {
            this.doomedCollect.push(_graph);
        }
        setPlayerCar(_car) {
            this.playerCar = _car;
        }
        generateCoins(_clusterCount, _clusterSize) {
            for (let j = 0; j < _clusterCount; j++) {
                let tempCluster = new ƒ.Node("Cluster" + j);
                let pos = new ƒ.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                for (let i = 0; i < _clusterSize; i++) {
                    let tempPos = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(pos.x + Math.random() * 0.1, pos.y + Math.random() * 0.1, pos.z + Math.random() * 0.1), 50.5);
                    let tempCoinNode = new ƒ.Node("Coin" + i);
                    let cmpTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                    tempCoinNode.addComponent(cmpTransform);
                    this.addGraphToNode(tempCoinNode, World.coinGraphID);
                    tempCoinNode.mtxLocal.translation = tempPos;
                    tempCoinNode.mtxLocal.lookAt(new ƒ.Vector3(0, 0, 0));
                    tempCoinNode.mtxLocal.rotateX(-90);
                    tempCluster.addChild(tempCoinNode);
                }
                this.coins.addChild(tempCluster);
            }
        }
        generateCans(_canCount) {
            for (let i = 0; i < _canCount; i++) {
                let tempPos = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1), 50.2);
                let tempCanNode = new ƒ.Node("Can" + i);
                let cmpTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                tempCanNode.addComponent(cmpTransform);
                this.addGraphToNode(tempCanNode, World.canGraphID);
                tempCanNode.mtxLocal.translation = tempPos;
                tempCanNode.mtxLocal.lookAt(new ƒ.Vector3(0, 0, 0));
                tempCanNode.mtxLocal.rotateX(-90);
                this.cans.addChild(tempCanNode);
            }
        }
        spliceDoomed() {
            if (this.doomedCollect.length > 0) {
                if (this.doomedCollect[0].idSource == World.coinGraphID) {
                    this.playerCar.incScore();
                }
                else {
                    this.playerCar.fillTank();
                }
                this.doomedCollect[0].getParent().getParent().removeChild(this.doomedCollect[0].getParent());
                this.doomedCollect.splice(0, 1);
            }
        }
        async addGraphToNode(_node, _id) {
            const graph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id]);
            _node.addChild(graph);
        }
    }
    Endabgabe.World = World;
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=Script.js.map