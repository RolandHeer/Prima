namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let graph: ƒ.Node;
  let lastKey: ƒ.KEYBOARD_CODE = ƒ.KEYBOARD_CODE.ESC;                             //Default Value
  let introSound: ƒ.ComponentAudio;
  let wakkaSound: ƒ.ComponentAudio;

  let ghosts: Ghost[] = []
  let mrFudge: MrFudge;

  let animations: ƒAid.SpriteSheetAnimations;

  let gridWidth: number = 7;
  let gridHeight: number = 7;

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
  // setup and start interactive viewport
  async function startInteractiveViewport(): Promise<void> {
    // load resources referenced in the link-tag
    await FudgeCore.Project.loadResourcesFromHTML();
    FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
    // pick the graph to show
    let graph: ƒ.Graph = <ƒ.Graph>FudgeCore.Project.resources["Graph|2022-04-07T17:26:03.173Z|68881"];
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

    await loadSprite();

    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }

  function start(_event: CustomEvent): void {
    setupViewport(_event);
    graph = viewport.getBranch();
    setupAudio();

    setupGrid();
    //createSprite();
    mrFudge = new MrFudge(graph, animations, wakkaSound);
    createGhosts(1);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    updateLastKey();
    lastKey = mrFudge.update(lastKey);
    viewport.draw();

    ƒ.AudioManager.default.update();
  }

  function updateLastKey(): void {
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

  async function loadSprite(): Promise<void> {
    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load("img/sprite.png");

    let spriteSheet: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheet)
    generateSprite(spriteSheet)
  }

  function generateSprite(_spritesheet: ƒ.CoatTextured): void {
    animations = {};
    let spriteName: string = "mrFudge";
    let tempSprite: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(spriteName, _spritesheet);
    tempSprite.generateByGrid(ƒ.Rectangle.GET(0, 0, 64, 64), 8, 70, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(64));
    animations[spriteName] = tempSprite;
  }

  function createGhosts(_count: number): void {
    for (let i: number = 0; i < _count; i++) {
      let tempNode: ƒ.Node = new ƒ.Node("ghostNr" + i);
      graph.addChild(tempNode);
      let tempGhost: Ghost = new Ghost(tempNode, mrFudge);
      ghosts.push(tempGhost);
    }
  }

  function setupViewport(_event: CustomEvent): void {
    viewport = _event.detail;
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(Math.floor(gridWidth / 2), Math.floor(gridHeight / 2), gridHeight * 1.7));
    viewport.camera.mtxPivot.rotateY(180, false);
  }

  function setupAudio(): void {
    let audioNode: ƒ.Node = graph.getChildrenByName("Sound")[0];
    introSound = <ƒ.ComponentAudio>audioNode.getAllComponents()[1];
    introSound.play(true);
    wakkaSound = <ƒ.ComponentAudio>audioNode.getAllComponents()[2];
    ƒ.AudioManager.default.listenTo(graph);
  }

  function setupGrid(): void {
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
}