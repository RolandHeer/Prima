namespace Endabgabe {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export interface Config {
    speedDivider: number;
    turnDivider: number;
    maxTurn: number;
    accelTurn: number;
    gazSub: number;
    camDelay: number;
    maxCoinCluster: number;
    maxCans: number;
    speedometerHeight: number;
    [key: string]: number | string | Config;
  }

  /// GAME HIRARCHIE \\\
  let canvas: HTMLCanvasElement;
  let crc2: CanvasRenderingContext2D;
  let graph: ƒ.Node;
  let viewport: ƒ.Viewport;
  let camNode: ƒ.Node;
  let cameraNode: ƒ.Node;
  let cameraTranslatorNode: ƒ.Node;
  let cmpCamera: ƒ.ComponentCamera;
  let carNode: ƒ.Node;
  let policeCarNode: ƒ.Node;

  ///   GAME MODES   \\\
  let isMenue: boolean = true;

  ///     VALUES     \\\
  let config: Config;

  ///     OBJECTS    \\\
  let car: PlayerCar;
  let policeCar: PoliceCar;
  let cam: Cam;
  let world: World;
  let gamestate: GameState;

  //       DATA      \\\
  let speedImg: HTMLImageElement = new Image;
  speedImg.src = "././Img/speedometer.png";

  let needleImg: HTMLImageElement = new Image;
  needleImg.src = "././Img/needle.png";

  let coinImg: HTMLImageElement = new Image;
  coinImg.src = "././Img/coin.png";

  /// RUNTIME VALUES \\\
  let jirkaMode: boolean = false;

  window.addEventListener("load", init);
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);
  let dialog: HTMLDialogElement;

  function init(_event: Event): void {
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

  async function startInteractiveViewport(): Promise<void> {
    // load resources referenced in the link-tag
    await FudgeCore.Project.loadResourcesFromHTML();
    FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
    // pick the graph to show
    graph = <ƒ.Graph>FudgeCore.Project.resources["Graph|2022-05-18T20:10:05.727Z|72077"];
    FudgeCore.Debug.log("Graph:", graph);
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new FudgeCore.ComponentCamera();
    canvas = document.querySelector("canvas");
    viewport = new FudgeCore.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    canvas.addEventListener("mousedown", enterPointerLock);
    window.addEventListener("keydown", hndKeydown);
    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }


  async function start(_event: CustomEvent): Promise<void> {
    let response: Response = await fetch("config.json");
    config = await response.json();
    initValues();
    gamestate = new GameState();
    world = new World(config, graph.getChildrenByName("World")[0], gamestate);
    setupCar();
    setupPolice();
    setupCam();
    setupAudio();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    world.update();
    car.update();
    policeCar.update();
    //cam.update(car.getCamPos());
    cam.update(car.getPosition(), car.getCamPos());
    ƒ.Physics.simulate();  // if physics is included and used
    ƒ.AudioManager.default.update();
    renderScreen();
  }

  function renderScreen(): void {
    viewport.draw();
    renderVUI();
  }

  function renderVUI(): void {
    // Coins
    let s: number = canvas.height * config.speedometerHeight;
    crc2.fillStyle = "#fff";
    crc2.font = s * 0.2 + "px AGENCYB";
    if (!jirkaMode) {
      crc2.drawImage(coinImg, s / 4, canvas.height - s * 0.46, s / 3, s / 3);
      crc2.font = s * 0.2 + "px AGENCYB";
      crc2.lineWidth = s * 0.05;
      crc2.strokeText("" + car.getScore(), s * 0.5, canvas.height - s * 0.1);
      crc2.fillText("" + car.getScore(), s * 0.5, canvas.height - s * 0.1);
    }
    // Speedometer and Gaz
    crc2.save();
    crc2.resetTransform();
    crc2.fillStyle = "#000";
    crc2.fillRect(canvas.width - s * 0.8, canvas.height - s * 0.7, s * 0.5, s * 0.5);
    crc2.fillStyle = "#444";
    crc2.fillRect(canvas.width - s * 0.69, canvas.height - s * 0.6, s * 0.3 * (car.getGazPercent() / 100), s * 0.2);      //Tankanzeigebalken
    crc2.drawImage(speedImg, canvas.width - s, canvas.height - s, s, s);
    crc2.translate(canvas.width - s * 0.53, canvas.height - s * 0.34);
    let x1: number = 0;
    let x2: number = -45;
    let y1: number = 180;
    let y2: number = 225;
    let rot: number = (Math.abs(car.getSpeedPercent()) * 180 - x1) * (y2 - x2) / (y1 - x1) + x2;
    crc2.rotate(rot * Math.PI / 180);
    crc2.drawImage(needleImg, -s * 0.45, -s / 16, s / 2, s / 8);
    crc2.restore();
  }

  function enterPointerLock(): void {
    canvas.requestPointerLock();
    isMenue = false;
  }

  function hndKeydown(_key: KeyboardEvent): void {
    switch (_key.code) {
      case "KeyM":
        isMenue = true;
        document.exitPointerLock();
        break;
      case "KeyJ":
        jirkaMode = !jirkaMode;
        if (jirkaMode) {
          document.getElementById("vui").style.visibility = "visible";
        } else {
          document.getElementById("vui").style.visibility = "hidden";
        }
    }
  }


  function initValues(): void {
    graph = viewport.getBranch();
    crc2 = canvas.getContext("2d");
  }

  function setupCar(): void {
    carNode = graph.getChildren()[0];
    car = new PlayerCar(config, carNode, world);
  }

  function setupPolice(): void {
    policeCarNode = graph.getChildrenByName("Police")[0].getChildrenByName("Cars")[0].getChildren()[0];
    policeCarNode.addEventListener("gottcha", (_e: CustomEvent) =>
      console.log(_e.detail.message));
    policeCar = new PoliceCar(config, policeCarNode, car);
  }

  function setupCam(): void {
    //viewport.camera = cmpCamera = carNode.getChildrenByName("PlayerMain")[0].getChildrenByName("testcam")[0].getComponent(ƒ.ComponentCamera);
    camNode = graph.getChildrenByName("NewCam")[0];
    viewport.camera = cmpCamera = camNode.getChildren()[0].getChildren()[0].getChildren()[0].getChildren()[0].getComponent(ƒ.ComponentCamera);
    cam = new Cam(camNode, car.getPosition(), config);
  }

  function setupAudio(): void {
    ƒ.AudioManager.default.listenTo(graph);
    ƒ.AudioManager.default.listenWith(carNode.getChild(0).getChildrenByName("Audio")[0].getComponent(ƒ.ComponentAudioListener));
  }
}