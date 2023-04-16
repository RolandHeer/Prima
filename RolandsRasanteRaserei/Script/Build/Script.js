"use strict";
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    class Cam {
        viewport;
        camNode;
        //Cameras
        activeCam = 0;
        camArray = [];
        camRear;
        constructor(_camNode, _carBodyNode, _viewport) {
            this.viewport = _viewport;
            this.camNode = _camNode;
            let cams = this.camNode.getChildren()[0];
            this.camArray.push(cams.getChildren()[0].getComponent(ƒ.ComponentCamera), cams.getChildren()[1].getComponent(ƒ.ComponentCamera), _carBodyNode.getChildrenByName("cam2")[0].getComponent(ƒ.ComponentCamera), _carBodyNode.getChildrenByName("cam3")[0].getComponent(ƒ.ComponentCamera));
            this.camRear = this.camNode.getChildren()[0].getChildren()[2].getComponent(ƒ.ComponentCamera);
        }
        update(_newDestRot) {
            this.camNode.mtxLocal.rotation = _newDestRot;
        }
        toggle() {
            this.camArray[this.activeCam].activate(false);
            this.activeCam = (this.activeCam + 1) % 4;
            this.camArray[this.activeCam].activate(true);
            this.viewport.camera = this.camArray[this.activeCam];
        }
        reverse(_bool) {
            if (_bool) {
                this.camArray[this.activeCam].activate(false);
                this.camRear.activate(true);
                this.viewport.camera = this.camRear;
            }
            else {
                this.camRear.activate(false);
                this.camArray[this.activeCam].activate(true);
                this.viewport.camera = this.camArray[this.activeCam];
            }
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
        smokeEmitter;
        //REFERENCES
        initTransform;
        initAngles;
        centerRB;
        mainRB;
        bumperRB;
        sphericalJoint;
        bumperWeld;
        mtxTireL;
        mtxTireR;
        engineSoundComponent;
        //RUNTIME VARIABLES
        ctrlTurn;
        velocity = ƒ.Vector3.ZERO();
        pos;
        gaz = 100;
        currentSpeed = 0;
        gripFactor = 0.0; // 0 = no grip, 1 = full grip
        lastInputDrive;
        isPolice = false;
        constructor(_carMainNode) {
            this.initTransform = _carMainNode.mtxLocal; //The Local Matrix of the Main RB-Object is used to determine all sorts of stuff. It is altered however, if we change the transform of its parents. This unfortunately is needed to easily place the car anywhere in the world. To counteract the transform of the parent object is stored to base the calculations on.
            this.initAngles = this.initTransform.getEulerAngles();
            this.smokeEmitter = _carMainNode.getChildren()[0].getChildrenByName("SmokeEmitter")[0];
        }
        getSpeedPercent() {
            return this.currentSpeed / 0.025;
        }
        updateDriving(_inputDrive, _f) {
            _f = Math.min(_f / this.config.speedDivider, 3);
            let forward;
            let mtxLocal = this.main.mtxLocal;
            let relativeZ = mtxLocal.getZ();
            relativeZ.transform(this.initTransform);
            forward = this.getForward(relativeZ);
            _inputDrive = this.evalInputDrive(_inputDrive, forward);
            this.handleGrip(forward, relativeZ, _f);
            this.mainRB.applyForce(ƒ.Vector3.SCALE(relativeZ, _inputDrive * 150 * _f));
            this.updateGaz(this.getSpeedPercent() * (Math.abs(_inputDrive * 2) * _f));
            this.lastInputDrive = _inputDrive;
            if (forward > 0) {
                return this.getSpeedPercent();
            }
            else {
                return -this.getSpeedPercent();
            }
        }
        updateTurning(_drive, _turnInput) {
            let relativeY = this.main.mtxLocal.getY();
            relativeY.transform(this.initTransform);
            this.ctrlTurn.setInput(_turnInput);
            this.mainRB.rotateBody((ƒ.Vector3.SCALE(relativeY, (this.ctrlTurn.getOutput() * Math.min(0.3, _drive) * Raserei.averageDeltaTime) / this.config.turnDivider)));
            this.updateTilt(_drive, this.ctrlTurn.getOutput());
            this.updateWheels(this.ctrlTurn.getOutput());
        }
        pinToGround() {
            this.mainRB.setPosition(ƒ.Vector3.NORMALIZATION(this.mainRB.getPosition(), 50.50)); //setzt den Abstand zur Weltmitte auf genau 50.4 (weltradius 50 plus abstand rigid body);
        }
        updatePos() {
            this.velocity = ƒ.Vector3.DIFFERENCE(this.mainRB.getPosition(), this.pos);
            this.pos = ƒ.Vector3.SCALE(this.mainRB.getPosition(), 1);
            this.setSpeed();
        }
        setSpeed() {
            this.currentSpeed = ƒ.Vector3.ZERO().getDistance(this.velocity) / Raserei.averageDeltaTime;
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
        handleGrip(_forward, _relativeZ, _f) {
            //The initial velocity is removed (while considering the gripFactor) and then the velocity strength is added to the direction the car is actually facing
            if (_forward >= 0) {
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.velocity, -1000 * this.gripFactor * _f));
                this.mainRB.applyForce(ƒ.Vector3.SCALE(_relativeZ, ƒ.Vector3.ZERO().getDistance(this.velocity) * (1100 * this.gripFactor) * _f));
            }
            else {
                this.mainRB.applyForce(ƒ.Vector3.SCALE(this.velocity, -1000 * this.gripFactor * _f));
                this.mainRB.applyForce(ƒ.Vector3.SCALE(_relativeZ, ƒ.Vector3.ZERO().getDistance(this.velocity) * (-1100 * this.gripFactor) * _f));
            }
        }
        updateSmoke() {
            this.world.addSmoke(this.smokeEmitter.mtxWorld.translation, 0.97 - (Math.min(Math.abs(this.lastInputDrive), 1) * 0.1));
        }
        getRelative2Dvector(_vDir, _vRot, _vInitRot) {
            let mtx = new ƒ.Matrix4x4();
            let vRot = ƒ.Vector3.SCALE(_vRot, -1);
            let vInitRot = ƒ.Vector3.SCALE(_vInitRot, -1);
            let vDir = ƒ.Vector3.SCALE(_vDir, 1);
            mtx.rotateX(vRot.x);
            mtx.rotateY(vRot.y);
            mtx.rotateZ(vRot.z);
            mtx.rotateX(vInitRot.x);
            mtx.rotateY(vInitRot.y);
            mtx.rotateZ(vInitRot.z);
            mtx.translate(vDir, true);
            return new ƒ.Vector2(mtx.translation.x, mtx.translation.z);
        }
        setupControls(_config) {
            this.ctrlTurn = new ƒ.Control("cntrlTurn", _config.maxTurn, 0 /* ƒ.CONTROL_TYPE.PROPORTIONAL */);
            this.ctrlTurn.setDelay(_config.accelTurn);
        }
        getForward(_relativeZ) {
            let dot = ƒ.Vector3.DOT(this.velocity, _relativeZ);
            if (dot > 0) {
                return 1;
            }
            else if (dot < 0) {
                return -1;
            }
            return 0;
        }
        evalInputDrive(_inputDrive, _forward) {
            if (this.gaz == 0) {
                if (_forward == 1 && _inputDrive >= 0) { //Driving Forward
                    _inputDrive = 0; //Disable Speedup without gaz while still beeing able to break
                }
                else if (_forward == -1 && _inputDrive < 0) { //Driving Backward
                    _inputDrive = 0; //Disable Speedup without gaz while still beeing able to break
                }
                else if (_forward == 0) { //Standing Still
                    _inputDrive = 0; //Disable Speedup without gaz
                }
            }
            if (_inputDrive < 0 && _forward <= 0) { //Reduce speed while driving backwards
                _inputDrive = _inputDrive / 3;
            }
            return _inputDrive;
        }
    }
    Raserei.Car = Car;
})(Raserei || (Raserei = {}));
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    class GameState extends ƒ.Mutable {
        coins = 0;
        constructor() {
            super();
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
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    //ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */:
                    let v = this.rigid.getPosition();
                    this.rigid.applyForce(ƒ.Vector3.SCALE(v, -0.2));
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    this.rigid = this.node.getComponent(ƒ.ComponentRigidbody);
                    this.node.addEventListener("renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */, this.hndEvent);
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
    let counting = true;
    Raserei.averageDeltaTime = 50;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    function init(_event) {
        window.addEventListener("keydown", startViewport);
    }
    function startViewport() {
        startInteractiveViewport();
        window.removeEventListener("keydown", startViewport);
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
        window.addEventListener("keyup", hndKeyup);
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
        document.getElementById("Startscreen").style.display = "none";
    }
    async function start(_event) {
        music.loop = true;
        music.volume = 0.7;
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
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        let f = ƒ.Loop.timeFrameGame; //factor that calculations are based on, to decouple them from the time used to generate the Frame. It is clipped to 3 to avoid unwanted behaviour when the Window is minimized during the game.
        updateDeltaTime();
        world.update(f);
        if (state == 1) {
            if (!counting) {
                car.update(true, f);
            }
        }
        if (state != 0) {
            if (!counting) {
                if (state != 1) {
                    policeCar.update(false, f);
                }
                else {
                    policeCar.update(true, f);
                }
                car.update(false, f);
            }
        }
        if (state > 1) {
            music.volume = Math.max(music.volume - (ƒ.Loop.timeFrameGame / 8000), 0);
            if (music.volume < 0.1) {
                history.go(0);
                return;
            }
        }
        cam.update(car.getCamPos());
        updateGameState();
        ƒ.Physics.simulate(); // if physics is included and used
        ƒ.AudioManager.default.update();
        renderScreen();
    }
    function getHighscore() {
        const x = document.cookie;
        let tmp = x.split('; ').find((row) => row.startsWith("highscore" + '='))?.split('=')[1];
        if (tmp != null) {
            return parseInt(tmp);
        }
        return 0;
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
        if (DeltaTimeArray.length > config.averageDeltaTime) {
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
                counting = false;
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
            crc2.fillText("Thanks for Playing!", canvas.width / 2, canvas.height * 0.65);
        }
    }
    function setHighscore(_score) {
        document.cookie = "highscore=" + _score + "; expires=Thu, 1 Dec 4711 12:00:00 UTC";
    }
    function enterPointerLock() {
        canvas.requestPointerLock();
    }
    function hndKeydown(_key) {
        switch (_key.code) {
            case "KeyM":
                document.exitPointerLock();
                break;
            case "KeyC":
                cam.toggle();
                break;
            case "ShiftLeft":
                cam.reverse(true);
        }
    }
    function hndKeyup(_key) {
        switch (_key.code) {
            case "ShiftLeft":
                cam.reverse(false);
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
        policeCar = new Raserei.PoliceCar(config, policeCarNode, car, world);
    }
    function setupCam() {
        camNode = graph.getChildrenByName("Car")[0].getChildrenByName("Camera")[0];
        viewport.camera = cmpCamera = camNode.getChildren()[0].getChildren()[0].getComponent(ƒ.ComponentCamera);
        cam = new Raserei.Cam(camNode, carNode.getChildren()[0].getChildrenByName("Body")[0], viewport);
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
        engineSound = new Audio("audio/2cv.mp3");
        coinSound = new Audio("audio/coin.wav");
        canSound = new Audio("audio/can.wav");
        constructor(_config, _carNode, _world) {
            super(_carNode);
            this.config = _config;
            this.world = _world;
            this.world.setPlayerCar(this);
            this.setupPlayerCar(_config, _carNode);
        }
        update(_playing, _f) {
            if (_playing) {
                this.updateTurning(this.updateDriving(ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]), _f), ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
                this.pinToGround();
                this.updateCamPosArray();
                this.updatePos();
            }
            this.updateEngineSound(_playing);
            this.updateSmoke();
        }
        incScore() {
            this.coinSound.currentTime = 0;
            this.coinSound.play();
            this.score++;
        }
        payForGas() {
            this.score -= this.config.gasprice;
        }
        fillTank() {
            this.canSound.currentTime = 0;
            this.canSound.play();
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
            this.engineSound.play();
            this.engineSound.volume = 0.1;
            this.engineSound.loop = true;
            if ("preservesPitch" in this.engineSound) {
                this.engineSound.preservesPitch = false;
            }
            else if ("mozPreservesPitch" in this.engineSound) {
                this.engineSound.mozPreservesPitch = false;
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
                this.engineSound.playbackRate = 1 + this.getSpeedPercent();
                this.engineSound.volume = Math.min(0.1 + (this.getSpeedPercent() * 0.9, 0.9) * 0.2);
            }
            else {
                this.engineSound.volume = Math.max(this.engineSound.volume - 0.01, 0);
            }
        }
        setupPlayerCar(_config, _carNode) {
            this.carNode = _carNode;
            this.main = _carNode.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];
            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.bumperRB = this.main.getChildrenByName("RigidBodies")[0].getChildren()[0].getComponent(ƒ.ComponentRigidbody);
            this.bumperWeld = new ƒ.JointWelding(this.mainRB, this.bumperRB);
            this.main.addComponent(this.bumperWeld);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.bumperRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.carNode.addComponent(this.sphericalJoint);
            this.mainRB.addEventListener("TriggerEnteredCollision" /* ƒ.EVENT_PHYSICS.TRIGGER_ENTER */, this.hndCollision);
            this.bumperRB.addEventListener("TriggerEnteredCollision" /* ƒ.EVENT_PHYSICS.TRIGGER_ENTER */, this.hndCollision);
            this.engineSoundComponent = this.main.getChildrenByName("Audio")[0].getAllComponents()[0];
            this.setupEngineSound();
            this.pos = ƒ.Vector3.SCALE(this.mainRB.getPosition(), 1);
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
            this.coinSound.volume = 0.2;
            this.canSound.volume = 0.8;
        }
    }
    Raserei.PlayerCar = PlayerCar;
})(Raserei || (Raserei = {}));
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    class PoliceCar extends Raserei.Car {
        player;
        distPlayer; //Distance to Player Car in Meter
        countdown;
        counting = false;
        sirenSoundComponent;
        gottchaEvent = new CustomEvent("gottcha", {
            detail: {
                message: "I got him lads!"
            }
        });
        constructor(_config, _carNode, _player, _world) {
            super(_carNode);
            this.config = _config;
            this.player = _player;
            this.isPolice = true;
            this.world = _world;
            this.setupPoliceCar(_config, _carNode);
        }
        update(_playing, _f) {
            this.distPlayer = this.mainRB.getPosition().getDistance(this.player.getPosition());
            let dir = this.getDir();
            this.updateTurning(this.updateDriving(dir.y, _f), dir.x);
            this.pinToGround();
            this.updatePos();
            this.updateCountdown();
            if (!_playing) {
                this.engineSoundComponent.volume = Math.max(this.engineSoundComponent.volume - 0.01, 0);
                this.sirenSoundComponent.volume = Math.max(this.sirenSoundComponent.volume - 0.01, 0);
            }
            this.updateSmoke();
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
            if (this.distPlayer > 10) {
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
            let vRot = this.main.mtxLocal.getEulerAngles();
            return this.evalDir(this.getRelative2Dvector(vDir, vRot, this.initAngles));
        }
        evalDir(vDir) {
            if (this.distPlayer > 20 && vDir.y <= 0) {
                vDir.set(vDir.x, -vDir.y);
            }
            //console.log("x: " + Math.round(vDir.x * 100) / 100 + ", y: " + Math.round(vDir.y * 100) / 100);
            return vDir;
        }
        setupPoliceCar(_config, _carNode) {
            this.carNode = _carNode;
            this.main = _carNode.getChildren()[0];
            this.body = this.main.getChildrenByName("Body")[0];
            this.centerRB = this.carNode.getComponent(ƒ.ComponentRigidbody);
            this.mainRB = this.main.getComponent(ƒ.ComponentRigidbody);
            this.bumperRB = this.main.getChildrenByName("RigidBodies")[0].getChildren()[0].getComponent(ƒ.ComponentRigidbody);
            this.bumperWeld = new ƒ.JointWelding(this.mainRB, this.bumperRB);
            this.main.addComponent(this.bumperWeld);
            this.sphericalJoint = new ƒ.JointSpherical(this.centerRB, this.mainRB);
            this.sphericalJoint.springFrequency = 0;
            this.centerRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.bumperRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_1;
            this.mainRB.addEventListener("ColliderEnteredCollision" /* ƒ.EVENT_PHYSICS.COLLISION_ENTER */, this.hndCollision);
            this.engineSoundComponent = this.main.getChildrenByName("Audio")[0].getAllComponents()[0];
            this.sirenSoundComponent = this.main.getChildrenByName("Audio")[0].getAllComponents()[1];
            this.pos = this.mainRB.getPosition();
            this.mtxTireL = this.main.getChildrenByName("TireFL")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.mtxTireR = this.main.getChildrenByName("TireFR")[0].getComponent(ƒ.ComponentTransform).mtxLocal;
            this.setupControls(_config);
            this.countdown = this.config.captureTime;
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
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    //ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */:
                    this.mtx.rotate(ƒ.Vector3.Y(this.rotationSpeed));
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    this.mtx = this.node.getComponent(ƒ.ComponentMesh).mtxPivot;
                    this.mtx.rotate(ƒ.Vector3.Y(Math.random() * 360));
                    this.node.addEventListener("renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */, this.hndEvent);
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.RotationScript = RotationScript;
})(Script || (Script = {}));
var Raserei;
(function (Raserei) {
    var ƒ = FudgeCore;
    class Smoke {
        smokeNode;
        smokeCloudNode;
        static smokeCloudID;
        smokeCloudInstance;
        rotation;
        size;
        riseDir;
        age = 0;
        maxAge = 0;
        constructor(_pos, _smokeNode, _config) {
            this.smokeNode = _smokeNode;
            Smoke.smokeCloudID = "Graph|2023-04-12T12:45:10.840Z|70362";
            this.smokeCloudNode = new ƒ.Node("Smoke");
            let cmpTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
            this.smokeCloudNode.addComponent(cmpTransform);
            this.addGraphToNode(this.smokeCloudNode, Smoke.smokeCloudID);
            this.smokeCloudNode.mtxLocal.translation = _pos;
            this.smokeNode.addChild(this.smokeCloudNode);
            this.rotation = new ƒ.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            this.size = ((Math.random() * 0.1) + 0.5);
            this.riseDir = new ƒ.Vector3(_pos.x, _pos.y, _pos.z);
            this.riseDir.normalize(1);
            this.maxAge = _config.smokeAge - (Math.random() * (_config.smokeAge / 2));
        }
        update(_f) {
            _f = _f * 0.1;
            this.smokeCloudInstance.mtxLocal.translate(ƒ.Vector3.SCALE(this.riseDir, 0.003 * _f));
            this.smokeCloudInstance.getComponent(ƒ.ComponentMesh).mtxPivot.scaling = ƒ.Vector3.ONE(this.size);
            this.smokeCloudInstance.getComponent(ƒ.ComponentMesh).mtxPivot.rotate(ƒ.Vector3.SCALE(this.rotation, _f * 2));
            this.size += 0.01 * _f;
            this.age += _f;
            //this.smokeCloudInstance.getComponent(ƒ.ComponentMaterial)                         //Hier Alphawert ändern 
            if (this.age > this.maxAge) {
                return true;
            }
            return false;
        }
        removeNode() {
            this.smokeNode.removeChild(this.smokeCloudNode);
        }
        async addGraphToNode(_node, _id) {
            const graph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id]);
            this.smokeCloudInstance = graph;
            _node.addChild(graph);
        }
    }
    Raserei.Smoke = Smoke;
})(Raserei || (Raserei = {}));
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
        smoke;
        smokeArray = [];
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
            this.smoke = _world.getChildrenByName("Smoke")[0];
            this.generateGraphCluster(World.treeGraphID, this.trees, 5, 5, 0.15, 0.8);
            this.generateGraphCluster(World.coinGraphID, this.coins, this.config.maxCoinCluster, 10, 0.1, 0);
            this.generateCans(this.config.maxCans);
        }
        update(_f) {
            this.updateSmoke(_f);
            this.spliceDoomedCollectables();
        }
        addToDoomedCollectables(_graph) {
            let inStack = false;
            for (let i = 0; i < this.doomedCollect.length; i++) {
                if (_graph == this.doomedCollect[0]) {
                    inStack = true;
                }
            }
            if (!inStack) {
                this.doomedCollect.push(_graph);
            }
        }
        setPlayerCar(_car) {
            this.playerCar = _car;
        }
        addSmoke(_pos, _probability) {
            if (Math.random() > _probability && this.smokeArray.length < this.config.maxSmokeAmmount) {
                this.smokeArray.push(new Raserei.Smoke(_pos, this.smoke, this.config));
            }
        }
        updateSmoke(_f) {
            for (let i = this.smokeArray.length - 1; i >= 0; i--) {
                if (this.smokeArray[i].update(_f)) {
                    this.smokeArray[i].removeNode();
                    this.smokeArray.splice(i, 1);
                }
            }
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
        spliceDoomedCollectables() {
            let splice = true;
            if (this.doomedCollect.length > 0) {
                if (this.doomedCollect[0].idSource == World.coinGraphID) {
                    this.playerCar.incScore();
                    this.gameState.coins += 1;
                    let coinCluster = this.doomedCollect[0].getParent().getParent();
                    if (coinCluster != null) {
                        if (coinCluster.getChildren().length == 1) {
                            coinCluster.getParent().removeChild(coinCluster);
                            this.generateGraphCluster(World.coinGraphID, this.coins, 1, 10, 0.1, 0);
                        }
                        else {
                            coinCluster.removeChild(this.doomedCollect[0].getParent());
                        }
                    }
                }
                else {
                    if (this.playerCar.getScore() - this.config.gasprice >= 0) {
                        this.playerCar.payForGas();
                        this.playerCar.fillTank();
                        this.doomedCollect[0].getParent().getParent().removeChild(this.doomedCollect[0].getParent());
                        this.generateCans(1);
                    }
                }
                if (splice) {
                    this.doomedCollect.splice(0, 1);
                }
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