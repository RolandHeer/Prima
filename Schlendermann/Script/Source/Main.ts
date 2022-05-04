namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  /// GAME HIRARCHIE \\\
  let canvas: HTMLCanvasElement;
  let graph: ƒ.Node;
  let viewport: ƒ.Viewport;
  let avatar: ƒ.Node;
  let camera: ƒ.Node;
  let cmpCamera: ƒ.ComponentCamera;
  let torch: ƒ.Node;

  /// AVATAR CONTROLS \\\
  let speedRotX: number = 0.3;
  let speedRotY: number = -0.3;
  let walkSpeed: number = 6;
  let ctrlWalk: ƒ.Control = new ƒ.Control("cntrlWalk", walkSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrlWalk.setDelay(200);
  let strafeSpeed: number = 2;
  let ctrlStrafe: ƒ.Control = new ƒ.Control("cntrlStrafe", strafeSpeed, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrlStrafe.setDelay(200);
  let rotX: number = 0;
  let rotY: number = 0;

  ///     BOOLEAN     \\\
  let lockMode: boolean = false;
  let torchOn: boolean = true;

  ///      VALUES      \\\
  let terrainX: number = 60;                      //Size of Terrain in meter
  let terrainZ: number = 60;
  let gridRows: number = 16;                      //Number of Rows
  let gridColumns: number = 10;                   //Number of Columns
  let maxGridOffset: number = 5;                  //Offset of Trees in meter

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
    canvas = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new FudgeCore.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    canvas.addEventListener("mousedown", enterPointerLock);
    window.addEventListener("keydown", hndKeydown);
    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }

  function start(_event: CustomEvent): void {
    initValues();
    setupAvatar(_event);
    createForest();
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

  function initValues(): void {
    //enterPointerLock();
  }

  function setupAvatar(_event: CustomEvent): void {
    viewport = _event.detail;
    graph = viewport.getBranch();
    avatar = viewport.getBranch().getChildrenByName("Avatar")[0];
    camera = avatar.getChild(0);
    viewport.camera = cmpCamera = camera.getComponent(ƒ.ComponentCamera);
    torch = camera.getChild(0);
    viewport.getCanvas().addEventListener("pointermove", hndPointerMove);
  }

  function hndPointerMove(_event: PointerEvent): void {
    if (lockMode) {
      rotY += _event.movementX * speedRotY;
      avatar.mtxLocal.rotation = ƒ.Vector3.Y(rotY);
      rotX += _event.movementY * speedRotX;
      rotX = Math.min(90, Math.max(-90, rotX));
      cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotX);
      torch.mtxLocal.rotation = ƒ.Vector3.X(rotX);
    }
  }

  function enterPointerLock(): void {
    canvas.requestPointerLock();
    lockMode = true;
  }

  function hndKeydown(_key: KeyboardEvent): void {
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

  function createForest(): void {
    let trees: ƒ.Node = graph.getChildren()[0].getChildrenByName("Trees")[0];
    //let terrainMesh: ƒ.MeshTerrain = <ƒ.MeshTerrain>graph.getChildren()[0].getChildrenByName("Terrain")[0].getComponent(ƒ.ComponentMesh).mesh;

    for (let k: number = 0; k < 2; k++) {
      for (let j: number = 0; j < gridRows / 2; j++) {
        for (let i: number = 0; i < gridColumns; i++) {
          let tempPos: ƒ.Vector3 = getRandomHexPosition(k, j, i, 0);
          let rot: number = Math.random() * 360;
          let scale: number = Math.random() * 0.4 + 0.6;
          let tempTreeNode: ƒ.Node = new ƒ.Node("Tree" + i);
          let comptransform: ƒ.ComponentTransform = new ƒ.ComponentTransform(new ƒ.Matrix4x4());
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


  function getRandomHexPosition(_k: number, _x: number, _z: number, _heightOffset: number): ƒ.Vector3 {
    let offset: ƒ.Vector2 = new ƒ.Vector2((terrainX / gridRows) * _k, (-terrainZ / (gridColumns * 2)) * _k);
    let random: ƒ.Vector2 = new ƒ.Vector2(Math.random() * maxGridOffset, Math.random() * maxGridOffset);
    let raster: ƒ.Vector2 = new ƒ.Vector2(((terrainX / (gridRows / 2)) * _x), ((terrainZ / gridColumns) * _z));
    let tempLoc: ƒ.Vector3 = new ƒ.Vector3(raster.x + offset.x + random.x - terrainX / 2, _heightOffset, raster.y + offset.y + random.y - terrainZ / 2);
    return tempLoc;
  }

  async function addGraphToNode(_node: ƒ.Node, _id: string) {
    const treeGraph = await ƒ.Project.createGraphInstance(ƒ.Project.resources[_id] as ƒ.Graph);
    _node.addChild(treeGraph);
  }

  function toggleTorch(): void {
    torchOn = !torchOn;
    torch.getComponent(ƒ.ComponentLight).activate(torchOn);
  }

  function setupAudio(): void {
    //let audioNode: ƒ.Node = graph.getChildrenByName("Sound")[0];
    ƒ.AudioManager.default.listenTo(graph);
  }
}