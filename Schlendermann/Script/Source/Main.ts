namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let graph: ƒ.Node;
  let viewport: ƒ.Viewport;
  let avatar: ƒ.Node;
  let camera: ƒ.Node;
  let cmpCamera: ƒ.ComponentCamera;

  let speedRotX: number = 0.1;
  let speedRotY: number = -0.1;
  let walkSpeed: number = 6;
  let ctrlWalk: ƒ.Control = new ƒ.Control("cntrlWalk", walkSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrlWalk.setDelay(200);
  let strafeSpeed: number = 2;
  let ctrlStrafe: ƒ.Control = new ƒ.Control("cntrlStrafe", strafeSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrlStrafe.setDelay(200);
  let rotX: number = 0;
  let rotY: number = 0;

  window.addEventListener("load", init);
  document.addEventListener("interactiveViewportStarted", <EventListener>start);
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
    let graph: ƒ.Graph = <ƒ.Graph>FudgeCore.Project.resources["Graph|2022-04-14T12:56:54.125Z|64295"];
    FudgeCore.Debug.log("Graph:", graph);
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new FudgeCore.ComponentCamera();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new FudgeCore.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }

  function start(_event: CustomEvent): void {
    setupAvatar(_event);
    setupAudio();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    walkController();
    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function walkController(): void {
    let inputWalk: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
    ctrlWalk.setInput(inputWalk);
    let inputStrafe: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])
    ctrlStrafe.setInput(inputStrafe);
    let speedMultiplier: number = 1;
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT])) {
      speedMultiplier = 1.7;
    }

    if (inputWalk > 0) {
      ctrlStrafe.setFactor(strafeSpeed * 0.75 * speedMultiplier);
    } else if (inputWalk < 0) {
      ctrlStrafe.setFactor(strafeSpeed * 0.3 * speedMultiplier);
    } else {
      ctrlStrafe.setFactor(strafeSpeed * speedMultiplier);
    }
    if (inputStrafe != 0) {
      ctrlWalk.setFactor(walkSpeed * 0.75 * speedMultiplier);
    } else {
      ctrlWalk.setFactor(walkSpeed * speedMultiplier);
    }
    if (inputWalk < 0) {
      ctrlWalk.setFactor(walkSpeed * 0.4 * speedMultiplier);
    }
    avatar.mtxLocal.translateZ(ctrlWalk.getOutput() * ƒ.Loop.timeFrameGame / 1000);
    avatar.mtxLocal.translateX(ctrlStrafe.getOutput() * ƒ.Loop.timeFrameGame / 1000);
  }

  function setupAvatar(_event: CustomEvent): void {
    viewport = _event.detail;
    graph = viewport.getBranch();
    avatar = viewport.getBranch().getChildrenByName("Avatar")[0];
    camera = avatar.getChild(0);
    viewport.camera = cmpCamera = camera.getComponent(ƒ.ComponentCamera);
    viewport.getCanvas().addEventListener("pointermove", hndPointerMove);
  }

  function hndPointerMove(_event: PointerEvent): void {
    rotY += _event.movementX * speedRotY;
    avatar.mtxLocal.rotation = ƒ.Vector3.Y(rotY);
    rotX += _event.movementY * speedRotX;
    rotX = Math.min(60, Math.max(-60, rotX));
    cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotX);
  }

  function setupAudio(): void {
    //let audioNode: ƒ.Node = graph.getChildrenByName("Sound")[0];
    ƒ.AudioManager.default.listenTo(graph);
  }
}