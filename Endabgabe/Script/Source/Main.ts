namespace Endabgabe {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export interface Config {
    fontHeight: number;
    margin: number;
    maxSpeed: number;
    accelSpeed: number;
    pMaxSpeed: number;
    pAccelSpeed: number;
    maxTurn: number;
    accelTurn: number;
    camDelay: number;
    maxCoinCluster: number;
    maxCans: number;
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
    cam.update(car.getCamPos());
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
    crc2.fillStyle = "#fff";
    crc2.font = config.fontHeight + "px Arial";
    if (!jirkaMode) {
      crc2.fillText("Coins: " + car.getScore(), config.margin, config.margin * 2);
    }
    // Gaz
    crc2.fillText("Gaz: " + Math.round(car.getGazPercent()) + "%", config.margin, config.margin * 4);
    // Speedometer
    crc2.save();
    crc2.resetTransform();
    crc2.translate(canvas.width - 200, canvas.height - 30);
    crc2.rotate((Math.abs(car.getSpeedPercent()) * 180) * Math.PI / 180);
    crc2.fillRect(-100, -5, 105, 10)
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
    camNode = graph.getChildrenByName("Cam")[0];
    cameraNode = camNode.getChildren()[0].getChildrenByName("Camera")[0];
    cameraTranslatorNode = cameraNode.getChildren()[0];
    viewport.camera = cmpCamera = cameraTranslatorNode.getComponent(ƒ.ComponentCamera);
    //viewport.camera = cmpCamera = carNode.getChildrenByName("Main")[0].getChildrenByName("testcam")[0].getComponent(ƒ.ComponentCamera);
    cam = new Cam(camNode);
  }

  function setupAudio(): void {
    ƒ.AudioManager.default.listenTo(graph);
    ƒ.AudioManager.default.listenWith(carNode.getChild(0).getChildrenByName("Audio")[0].getComponent(ƒ.ComponentAudioListener));
  }
}