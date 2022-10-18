"use strict";
var Raserei;
(function (Raserei) {
    class Cam {
        /*private config: Config;
        private centerRB: ƒ.ComponentRigidbody;
        private main: ƒ.Node;
        private mainRB: ƒ.ComponentRigidbody;
        private reAnker: ƒ.Node;*/
        camNode;
        constructor(_camNode, _carPos, _config) {
            //this.config = _config;
            this.camNode = _camNode;
            //this.centerRB = this.camNode.getComponent(ƒ.ComponentRigidbody);
            //this.main = this.camNode.getChildren()[0];
            //this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            //let sphericalJoint: ƒ.JointSpherical = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            //sphericalJoint.springFrequency = 0;
            //this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_2;
            //this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_2;
            //this.reAnker = this.main.getChildren()[0].getChildren()[0];
            //this.camNode.addComponent(sphericalJoint);
        }
        update(_newDestRot) {
            this.camNode.mtxLocal.rotation = _newDestRot;
            /*
            let f: number = ƒ.Loop.timeFrameGame / this.config.speedDivider;
            this.mainRB.applyForce(ƒ.Vector3.SCALE(ƒ.Vector3.DIFFERENCE(_newDestPos, this.mainRB.getPosition()), 50 * f));//Force into new Position
            this.pinToGround();
            this.mainRB.setRotation(_newDestRot);
           // this.reAnker.mtxLocal.lookAt(new ƒ.Vector3(0.01, 0.01, 0.01), this.main.mtxLocal.getY(), true);*/
        }
    }
    Raserei.Cam = Cam;
})(Raserei || (Raserei = {}));
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    class Car {
        //OBJECTS
        config;
        world;
        //NODES
        carNode;
        main;
        body;
        //REFERENCES
        centerRB;
        mainRB;
        sphericalJoint;
        mtxTireL;
        mtxTireR;
        engineSoundComponent;
        //RUNTIME VARIABLES
        ctrlTurn;
        velocity = ƒ.Vector3.ZERO();
        pos;
        gaz = 100;
        currentSpeed = 0;
        gripFactor = 0.8; // 0 = no grip, 1 = full grip
        isPolice = false;
        getSpeedPercent() {
            return this.currentSpeed / 0.025;
        }
        updateDriving(_inputDrive) {
            let forward;
            if (this.getRelative2Dvector(this.velocity, this.main.mtxLocal.getEulerAngles()).y > 0) {
                forward = 1;
            }
            else if (this.getRelative2Dvector(this.velocity, this.main.mtxLocal.getEulerAngles()).y < 0) {
                forward = -1;
            }
            else {
                forward = 0;
            }
            if (this.gaz == 0) {
                if (forward == 1 && _inputDrive >= 0) { //Driving Forward
                    _inputDrive = 0; //Disable Speedup without gaz while still beeing able to break
                }
                else if (forward == -1 && _inputDrive < 0) { //Driving Backward
                    _inputDrive = 0; //Disable Speedup without gaz while still beeing able to break
                }
                else if (forward == 0) { //Standing Still
                    _inputDrive = 0; //Disable Speedup without gaz
                }
            }
            if (_inputDrive < 0 && forward <= 0) {
                _inputDrive = _inputDrive / 3;
            }
            let f = ƒ.Loop.timeFrameGame / this.config.speedDivider;
            if (forward >= 0) {
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.velocity, -1000 * this.gripFactor * f));
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.main.mtxLocal.getZ(), ƒ.Vector3.ZERO().getDistance(this.velocity) * (1100 * this.gripFactor) * f));
            }
            else {
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.velocity, -1000 * this.gripFactor * f));
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.main.mtxLocal.getZ(), ƒ.Vector3.ZERO().getDistance(this.velocity) * (-1100 * this.gripFactor) * f));
            }
            this.mainRB.applyForce(ƒ.Vector3.SCALE(this.main.mtxLocal.getZ(), _inputDrive * 150 * f));
            this.updateGaz(this.getSpeedPercent() * (Math.abs(_inputDrive * 2) * f)); //ehemals Loop Frame Time
            if (forward > 0) {
                return this.getSpeedPercent();
            }
            else {
                return -this.getSpeedPercent();
            }
        }
        updateTurning(_drive, _turnInput) {
            let f = Raserei.averageDeltaTime / this.config.turnDivider;
            this.ctrlTurn.setInput(_turnInput);
            this.mainRB.rotateBody(ƒ.Vector3.SCALE(this.main.mtxLocal.getY(), this.ctrlTurn.getOutput() * Math.min(0.3, _drive) * f));
            this.updateTilt(_drive, this.ctrlTurn.getOutput());
            this.updateWheels(this.ctrlTurn.getOutput());
        }
        pinToGround() {
            this.mainRB.setPosition(ƒ.Vector3.NORMALIZATION(this.mainRB.getPosition(), 50.45)); //setzt den Abstand zur Weltmitte auf genau 50.4 (weltradius 50 plus abstand rigid body);
        }
        updatePos() {
            this.velocity = ƒ.Vector3.DIFFERENCE(this.mainRB.getPosition(), this.pos);
            this.pos = ƒ.Vector3.SCALE(this.mainRB.getPosition(), 1);
            this.setSpeed();
        }
        setSpeed() {
            this.currentSpeed = ƒ.Vector3.ZERO().getDistance(this.velocity) / Raserei.averageDeltaTime; //falls loop Frame Time doch noch verwendet werden sollte hier durch tatsächliche Zeit teilen
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
        getRelative2Dvector(_vDir, _vRot) {
            let mtx = new ƒ.Matrix4x4();
            let refMtx = new ƒ.Matrix4x4();
            let vRot = ƒ.Vector3.SCALE(_vRot, -1);
            let vDir = ƒ.Vector3.SCALE(_vDir, 1);
            mtx.rotateX(vRot.x);
            mtx.rotateY(vRot.y);
            mtx.rotateZ(vRot.z);
            mtx.translate(vDir, true);
            mtx.getTranslationTo(refMtx);
            return new ƒ.Vector2(mtx.translation.x, mtx.translation.z);
        }
        setupControls(_config) {
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, 0 /* PROPORTIONAL */);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }
    }
    Raserei.Car = Car;
})(Raserei || (Raserei = {}));
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class GameState extends ƒ.Mutable {
        coins = 0;
        constructor() {
            super();
            const domVui = document.querySelector("div#vui");
            console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
        }
        reduceMutator(_mutator) { }
    }
    Raserei.GameState = GameState;
})(Raserei || (Raserei = {}));
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
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    /// GAME HIRARCHIE \\\
    let canvas;
    let crc2;
    let graph;
    let viewport;
    let camNode;
    let cmpCamera;
    let carNode;
    let policeCarNode;
    ///   GAME MODES   \\\
    let lockMode = true;
    let state = 1; //0=menue; 1=game running; 2=police got you; 3=no fuel
    ///     VALUES     \\\
    let config;
    let highscore = getHighscore();
    ///     OBJECTS    \\\
    let car;
    let policeCar;
    let cam;
    let world;
    let gamestate;
    //       DATA      \\\
    let speedImg = new Image;
    speedImg.src = "././Img/speedometer.png";
    let needleImg = new Image;
    needleImg.src = "././Img/needle.png";
    let coinImg = new Image;
    coinImg.src = "././Img/coin.png";
    let music = new Audio("audio/Slider.mp3");
    /// RUNTIME VALUES \\\
    let DeltaTimeArray = [];
    let countIn = 0;
    Raserei.averageDeltaTime = 50;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    let dialog;
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        window.addEventListener("keydown", startViewport);
        //@ts-ignore
        dialog.showModal();
    }
    function startViewport() {
        dialog.close();
        startInteractiveViewport();
        window.removeEventListener("keydown", startViewport);
    }
    function getHighscore() {
        const x = document.cookie;
        let tmp = x.split('; ').find((row) => row.startsWith("highscore" + '='))?.split('=')[1];
        if (tmp != null) {
            return parseInt(tmp);
        }
        return 0;
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
        music.loop = true;
        music.play();
        let response = await fetch("config.json");
        config = await response.json();
        initValues();
        gamestate = new Raserei.GameState();
        world = new Raserei.World(config, graph.getChildrenByName("World")[0], gamestate);
        setupCar();
        setupPolice();
        setupCam();
        setupAudio();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        //console.log(averageDeltaTime);
        updateDeltaTime();
        world.update();
        if (state == 1) {
            car.update(true);
        }
        if (state != 0) {
            if (state != 1) {
                policeCar.update(false);
            }
            else {
                policeCar.update(true);
            }
            car.update(false);
        }
        if (state > 1) {
            music.volume = Math.max(music.volume - (ƒ.Loop.timeFrameGame / 7000), 0);
            if (music.volume == 0) {
                document.location.reload();
            }
        }
        cam.update(car.getCamPos());
        updateGameState();
        ƒ.Physics.simulate(); // if physics is included and used
        ƒ.AudioManager.default.update();
        renderScreen();
    }
    function updateGameState() {
        if (policeCar.hasHim() && state == 1) {
            state = 2;
            console.log("I hope you like beans Bud!");
        }
        if (car.isOutOfFuel() && state == 1) {
            state = 3;
            console.log("He is dry lads!");
        }
    }
    function updateDeltaTime() {
        DeltaTimeArray.push(ƒ.Loop.timeFrameGame);
        if (DeltaTimeArray.length > config.averageCount) {
            DeltaTimeArray.splice(0, 1);
        }
        let tempAverage = 0;
        for (let i = 0; i < DeltaTimeArray.length; i++) {
            tempAverage += DeltaTimeArray[i];
        }
        tempAverage = tempAverage / Math.max(DeltaTimeArray.length - 1, 1);
        Raserei.averageDeltaTime = tempAverage;
    }
    function renderScreen() {
        viewport.draw();
        renderVUI();
    }
    function renderVUI() {
        let f = canvas.height * config.speedometerHeight;
        //CountIN
        if (countIn < 3000) {
            crc2.fillStyle = "#fff";
            crc2.font = f * 0.5 + "px AGENCYB";
            crc2.lineWidth = f * 0.1;
            crc2.textAlign = "center";
            if (countIn < 700) {
                crc2.strokeText("5", canvas.width / 2, canvas.height / 2);
                crc2.fillText("5", canvas.width / 2, canvas.height / 2);
            }
            else if (countIn < 1150) {
                crc2.strokeText("4", canvas.width / 2, canvas.height / 2);
                crc2.fillText("4", canvas.width / 2, canvas.height / 2);
            }
            else if (countIn < 1500) {
                crc2.strokeText("3", canvas.width / 2, canvas.height / 2);
                crc2.fillText("3", canvas.width / 2, canvas.height / 2);
            }
            else if (countIn < 1850) {
                crc2.strokeText("2", canvas.width / 2, canvas.height / 2);
                crc2.fillText("2", canvas.width / 2, canvas.height / 2);
            }
            else if (countIn < 2200) {
                crc2.strokeText("1", canvas.width / 2, canvas.height / 2);
                crc2.fillText("1", canvas.width / 2, canvas.height / 2);
            }
            else if (countIn < 2550) {
                crc2.strokeText("0", canvas.width / 2, canvas.height / 2);
                crc2.fillText("0", canvas.width / 2, canvas.height / 2);
            }
            countIn += ƒ.Loop.timeFrameGame;
        }
        // Coins
        crc2.textAlign = "left";
        crc2.fillStyle = "#fff";
        crc2.font = f * 0.2 + "px AGENCYB";
        crc2.drawImage(coinImg, f / 4, canvas.height - f * 0.46, f / 3, f / 3);
        crc2.font = f * 0.2 + "px AGENCYB";
        crc2.lineWidth = f * 0.05;
        crc2.strokeText("" + car.getScore(), f * 0.5, canvas.height - f * 0.1);
        crc2.fillText("" + car.getScore(), f * 0.5, canvas.height - f * 0.1);
        // Speedometer and Gaz
        crc2.save();
        crc2.resetTransform();
        crc2.fillStyle = "#000";
        crc2.fillRect(canvas.width - f * 0.8, canvas.height - f * 0.7, f * 0.5, f * 0.5);
        crc2.fillStyle = "#444";
        crc2.fillRect(canvas.width - f * 0.69, canvas.height - f * 0.6, f * 0.3 * (car.getGazPercent() / 100), f * 0.2); //Tankanzeigebalken
        crc2.drawImage(speedImg, canvas.width - f, canvas.height - f, f, f);
        crc2.translate(canvas.width - f * 0.53, canvas.height - f * 0.34);
        let x1 = 0;
        let x2 = -45;
        let y1 = 180;
        let y2 = 225;
        let rot = (Math.abs(car.getSpeedPercent()) * 180 - x1) * (y2 - x2) / (y1 - x1) + x2;
        crc2.rotate(rot * Math.PI / 180);
        crc2.drawImage(needleImg, -f * 0.45, -f / 16, f / 2, f / 8);
        crc2.restore();
        // Countdown
        if (policeCar.isCounting()) {
            crc2.fillStyle = "#fff";
            crc2.font = f * 0.5 + "px AGENCYB";
            crc2.lineWidth = f * 0.1;
            crc2.textAlign = "center";
            crc2.strokeText("" + policeCar.getCountdown(), canvas.width / 2, canvas.height / 2);
            crc2.fillText("" + policeCar.getCountdown(), canvas.width / 2, canvas.height / 2);
        }
        drawMenu(f);
    }
    function drawMenu(f) {
        if (state > 1) {
            let heading;
            if (state == 2) {
                heading = "YOU HAVE BEEN CAUGHT";
            }
            else if (state == 3) {
                heading = "YOUR GAS TANK HAS RUN DRY";
            }
            if (car.getScore() > highscore) {
                setHighscore(car.getScore());
                heading = "NEW HIGHSCORE!";
            }
            crc2.textAlign = "center";
            crc2.fillStyle = "#000";
            crc2.globalAlpha = 0.7;
            crc2.fillRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
            crc2.globalAlpha = 1;
            crc2.fillStyle = "#fff";
            crc2.font = f * 0.25 + "px AGENCYB";
            crc2.fillText(heading, canvas.width / 2, canvas.height * 0.35);
            crc2.font = f * 0.2 + "px AGENCYB";
            if (heading == "NEW HIGHSCORE!") {
                crc2.fillText("Score: " + car.getScore(), canvas.width / 2, canvas.height * 0.45);
                crc2.fillText("old highscore: " + highscore, canvas.width / 2, canvas.height * 0.55);
            }
            else {
                crc2.fillText("HIGHSCORE: " + highscore, canvas.width / 2, canvas.height * 0.45);
                crc2.fillText("Your score: " + car.getScore(), canvas.width / 2, canvas.height * 0.55);
            }
            crc2.font = f * 0.15 + "px AGENCYB";
            crc2.fillText("Thanks for Playing! Press F5 to restart 0:)", canvas.width / 2, canvas.height * 0.65);
        }
    }
    function setHighscore(_score) {
        document.cookie = "highscore=" + _score + "; expires=Thu, 1 Dec 4711 12:00:00 UTC";
    }
    function enterPointerLock() {
        canvas.requestPointerLock();
        lockMode = false;
    }
    function hndKeydown(_key) {
        switch (_key.code) {
            case "KeyM":
                lockMode = true;
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
        car = new Raserei.PlayerCar(config, carNode, world);
    }
    function setupPolice() {
        policeCarNode = graph.getChildrenByName("Police")[0].getChildrenByName("Cars")[0].getChildren()[0];
        policeCarNode.addEventListener("gottcha", (_e) => console.log(_e.detail.message));
        policeCar = new Raserei.PoliceCar(config, policeCarNode, car);
    }
    function setupCam() {
        //viewport.camera = cmpCamera = carNode.getChildrenByName("PlayerMain")[0].getChildrenByName("testcam")[0].getComponent(ƒ.ComponentCamera);
        camNode = graph.getChildrenByName("NewCam")[0];
        viewport.camera = cmpCamera = camNode.getChildren()[0].getChildren()[0].getChildren()[0].getChildren()[0].getComponent(ƒ.ComponentCamera);
        cam = new Raserei.Cam(camNode, car.getPosition(), config);
    }
    function setupAudio() {
        ƒ.AudioManager.default.listenTo(graph);
        ƒ.AudioManager.default.listenWith(carNode.getChild(0).getChildrenByName("Audio")[0].getComponent(ƒ.ComponentAudioListener));
    }
})(Raserei || (Raserei = {}));
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    class PlayerCar extends Raserei.Car {
        // Runtime Values 
        score = 0;
        camPosArray = [];
        audio = new Audio("audio/2cv.mp3");
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
            this.engineSoundComponent = this.main.getChildrenByName("Audio")[0].getAllComponents()[0];
            this.setupEngineSound();
            this.pos = ƒ.Vector3.SCALE(this.mainRB.getPosition(), 1);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
        }
        update(_playing) {
            if (_playing) {
                this.updateTurning(this.updateDriving(ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])), ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
                this.pinToGround();
                this.updateCamPosArray();
                this.updatePos();
            }
            this.updateEngineSound(_playing);
        }
        incScore() {
            this.score++;
        }
        fillTank() {
            this.gaz = 100;
        }
        getCamPos() {
            return this.camPosArray[0];
        }
        getGazPercent() {
            return this.gaz;
        }
        isOutOfFuel() {
            if (this.gaz == 0 && this.getSpeedPercent() < 0.01) {
                return true;
            }
            return false;
        }
        getScore() {
            return this.score;
        }
        getPosition() {
            return ƒ.Vector3.SCALE(this.mainRB.getPosition(), 1);
        }
        getRotation() {
            return ƒ.Vector3.SCALE(this.main.mtxLocal.getEulerAngles(), 1);
        }
        hndCollision = (_event) => {
            let graph = _event.cmpRigidbody.node;
            if (graph.idSource == Raserei.World.coinGraphID || graph.idSource == Raserei.World.canGraphID) {
                this.world.addToDoomedCollectables(graph);
            }
        };
        updateGaz(_factor) {
            this.gaz = Math.max(0, this.gaz - this.config.fuelConsumption * Math.abs(_factor));
        }
        setupEngineSound() {
            this.audio.play();
            this.audio.volume = 0.1;
            this.audio.loop = true;
            if ("preservesPitch" in this.audio) {
                this.audio.preservesPitch = false;
            }
            else if ("mozPreservesPitch" in this.audio) {
                this.audio.mozPreservesPitch = false;
            }
        }
        updateCamPosArray() {
            let tempPos = this.main.mtxLocal.getEulerAngles();
            let newPos = new ƒ.Vector3(tempPos.x, tempPos.y, tempPos.z);
            this.camPosArray.push(newPos);
            if (this.camPosArray.length > this.config.camDelay) {
                this.camPosArray.splice(0, 1);
            }
        }
        updateEngineSound(_playing) {
            if (_playing) {
                this.audio.playbackRate = 1 + this.getSpeedPercent();
                this.audio.volume = Math.min(0.1 + (this.getSpeedPercent() * 0.9, 0.9));
            }
            else {
                this.audio.volume = Math.max(this.audio.volume - 0.01, 0);
            }
        }
    }
    Raserei.PlayerCar = PlayerCar;
})(Raserei || (Raserei = {}));
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    class PoliceCar extends Raserei.Car {
        player;
        countdown;
        counting = true;
        sirenSoundComponent;
        gottchaEvent = new CustomEvent("gottcha", {
            detail: {
                message: "I got him lads!"
            }
        });
        constructor(_config, _carNode, _player) {
            super();
            this.config = _config;
            this.player = _player;
            this.isPolice = true;
            this.carNode = _carNode;
            this.main = _carNode.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];
            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, this.hndCollision);
            this.mainRB.setPosition(new ƒ.Vector3(0, 0, -50.5));
            this.mainRB.setRotation(new ƒ.Vector3(-90, 0, 0));
            this.engineSoundComponent = this.main.getChildrenByName("Audio")[0].getAllComponents()[0];
            this.sirenSoundComponent = this.main.getChildrenByName("Audio")[0].getAllComponents()[1];
            this.pos = this.mainRB.getPosition();
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
            this.countdown = this.config.captureTime;
        }
        update(_playing) {
            let dir = this.getDir();
            this.updateTurning(this.updateDriving(dir.y), dir.x);
            this.pinToGround();
            this.updatePos();
            this.updateCountdown();
            if (!_playing) {
                this.engineSoundComponent.volume = Math.max(this.engineSoundComponent.volume - 0.01, 0);
                this.sirenSoundComponent.volume = Math.max(this.sirenSoundComponent.volume - 0.01, 0);
            }
        }
        hasHim() {
            if (this.getCountdown() == 0) {
                return true;
            }
            return false;
        }
        isCounting() {
            return this.counting;
        }
        getCountdown() {
            return Math.max(Math.floor(this.countdown / 1000), 0);
        }
        updateGaz(_factor) {
        }
        updateCountdown() {
            if (this.mainRB.getPosition().getDistance(this.player.getPosition()) > 10) {
                this.counting = false;
                this.countdown = this.config.captureTime;
            }
            else {
                this.counting = true;
                this.countdown -= ƒ.Loop.timeFrameGame;
            }
        }
        hndCollision = (_event) => {
            let node = _event.cmpRigidbody.node;
            if (node.name == "PlayerMain") {
                this.carNode.dispatchEvent(this.gottchaEvent);
            }
        };
        getDir() {
            let vDir = ƒ.Vector3.DIFFERENCE(this.player.getPosition(), this.mainRB.getPosition());
            vDir.normalize();
            return this.getRelative2Dvector(vDir, this.main.mtxLocal.getEulerAngles());
            ;
        }
    }
    Raserei.PoliceCar = PoliceCar;
})(Raserei || (Raserei = {}));
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
var Raserei;
(function (Raserei) {
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
    Raserei.Vector = Vector;
})(Raserei || (Raserei = {}));
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    class World {
        config;
        coins;
        static coinGraphID;
        cans;
        static canGraphID;
        trees;
        static treeGraphID;
        doomedCollect = [];
        playerCar;
        gameState;
        constructor(_config, _world, _gameState) {
            this.config = _config;
            this.gameState = _gameState;
            this.coins = _world.getChildrenByName("Collectables")[0].getChildrenByName("Coins")[0];
            World.coinGraphID = "Graph|2022-06-11T00:20:48.515Z|71676";
            this.cans = _world.getChildrenByName("Collectables")[0].getChildrenByName("Cans")[0];
            World.canGraphID = "Graph|2022-06-10T22:51:14.617Z|07901";
            this.trees = _world.getChildrenByName("Plants")[0].getChildrenByName("Trees")[0];
            World.treeGraphID = "Graph|2022-07-18T02:17:48.525Z|91815";
            this.generateGraphCluster(World.treeGraphID, this.trees, 5, 5, 0.15, 0.8);
            this.generateGraphCluster(World.coinGraphID, this.coins, this.config.maxCoinCluster, 10, 0.1, 0);
            this.generateCans(this.config.maxCans);
        }
        update() {
            this.spliceDoomed();
        }
        addToDoomedCollectables(_graph) {
            this.doomedCollect.push(_graph);
        }
        setPlayerCar(_car) {
            this.playerCar = _car;
        }
        generateGraphCluster(_graphID, _destNode, _clusterCount, _clusterSize, _spread, _randomScale) {
            for (let j = 0; j < _clusterCount; j++) {
                let tempCluster = new ƒ.Node("Cluster" + j);
                let pos = new ƒ.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                for (let i = 0; i < _clusterSize; i++) {
                    let tempPos = ƒ.Vector3.NORMALIZATION(new ƒ.Vector3(pos.x + Math.random() * _spread, pos.y + Math.random() * _spread, pos.z + Math.random() * _spread), 50);
                    let tempNode = new ƒ.Node("Graph" + i);
                    let cmpTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
                    tempNode.addComponent(cmpTransform);
                    this.addGraphToNode(tempNode, _graphID);
                    tempNode.mtxLocal.translation = tempPos;
                    tempNode.mtxLocal.lookAt(new ƒ.Vector3(0, 0, 0));
                    tempNode.mtxLocal.rotateX(-90);
                    tempNode.mtxLocal.rotateY(Math.random() * 360);
                    if (_randomScale > 0) {
                        let r = 0.5 + (Math.random() * _randomScale);
                        tempNode.mtxLocal.scale(new ƒ.Vector3(r, r, r));
                    }
                    tempCluster.addChild(tempNode);
                }
                _destNode.addChild(tempCluster);
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
                    this.gameState.coins += 1;
                    let coinCluster = this.doomedCollect[0].getParent().getParent();
                    if (coinCluster.getChildren().length == 1) {
                        coinCluster.getParent().removeChild(coinCluster);
                        this.generateGraphCluster(World.coinGraphID, this.coins, 1, 10, 0.1, 0);
                    }
                    else {
                        coinCluster.removeChild(this.doomedCollect[0].getParent());
                    }
                }
                else {
                    this.playerCar.fillTank();
                    this.doomedCollect[0].getParent().getParent().removeChild(this.doomedCollect[0].getParent());
                    this.generateCans(1);
                }
                this.doomedCollect.splice(0, 1);
            }
        }
        async addGraphToNode(_node, _id) {
            const graph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id]);
            _node.addChild(graph);
        }
    }
    Raserei.World = World;
})(Raserei || (Raserei = {}));
//# sourceMappingURL=Script.js.map