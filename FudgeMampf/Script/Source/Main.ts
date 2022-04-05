namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let graph: ƒ.Node;
  let grid: ƒ.Node;
  let mrFudge: ƒ.Node;
  let fudgeRot: ƒ.Node;
  let speed: number = 1 / 20;
  let translation: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let corrector: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let lastKey: ƒ.KEYBOARD_CODE;
  let wakkaSound: ƒ.ComponentAudio;
  let foodCount: number = 0;

  let threshold: number = 0.1;

  //let gridWidth: number = 5;
  //let gridHeight: number = 5;


  window.addEventListener("load", init);
  document.addEventListener("interactiveViewportStarted", <EventListener>start);
  // show dialog for startup
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
    let graph: ƒ.Graph = <ƒ.Graph>FudgeCore.Project.resources["Graph|2022-03-22T16:28:13.976Z|87928"];
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
    FudgeCore.Debug.log("Viewport:", viewport);
    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }
  //})(document.head.querySelector("meta[autoView]").getAttribute("autoView"));



  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    graph = viewport.getBranch();
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(3, 3, 13));
    viewport.camera.mtxPivot.rotateY(180, false);
    grid = graph.getChildrenByName("Grid")[0];
    mrFudge = graph.getChildrenByName("MrFudge")[0];
    fudgeRot = mrFudge.getChildrenByName("rotation")[0];
    let audioNode: ƒ.Node = graph.getChildrenByName("Sound")[0];
    wakkaSound = <ƒ.ComponentAudio>audioNode.getAllComponents()[2];
    setupGrid();
    ƒ.AudioManager.default.listenTo(graph);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    updateMrFudge();
    viewport.draw();

    ƒ.AudioManager.default.update();
  }

  function updateMrFudge(): void {
    updateLastKey();
    updateDirection();
    if (translation.x == 0 && translation.y == 0) {
      wakkaSound.volume = 0;
    } else {
      wakkaSound.volume = 0.3;
    }

    if ((mrFudge.mtxLocal.translation.y % 1) + threshold / 2 < threshold && (mrFudge.mtxLocal.translation.x % 1) + threshold / 2 < threshold) { //schaut ob sich Mr.Fudge auf einem Knotenpunkt befindet
      let fudgeTilePos: ƒ.Vector2 = new ƒ.Vector2(Math.round(mrFudge.mtxLocal.translation.x), Math.round(mrFudge.mtxLocal.translation.y));
      if (!isEaten(fudgeTilePos.x, fudgeTilePos.y)) {
        eatTile(fudgeTilePos);
      }
      if (isPath(Math.round(translation.x / speed), Math.round(translation.y / speed))) {                                                       //schaut ob das kommende Tile eine Wand ist
        mrFudge.mtxLocal.translate(translation);
      } else {
        corrector.set(Math.round(mrFudge.mtxLocal.translation.x), Math.round(mrFudge.mtxLocal.translation.y), 0);                               //setzt Mr. Fudge auf die Mitte des Tiles
        mrFudge.mtxLocal.translation = corrector;
        translation.set(0, 0, 0);
      }
    } else {
      mrFudge.mtxLocal.translate(translation);
    }
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

  function updateDirection(): void { // Methode funktioniert nicht all zu gut im negativen Bereich... vielleicht mal danach schauen
    switch (lastKey) {
      case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
        if ((mrFudge.mtxLocal.translation.y % 1) + threshold / 2 < threshold) {
          if (isPath(1, 0)) {
            corrector.set(mrFudge.mtxLocal.translation.x, Math.round(mrFudge.mtxLocal.translation.y), 0);
            mrFudge.mtxLocal.translation = corrector;
            fudgeRot.mtxLocal.rotateZ(0 - fudgeRot.mtxLocal.getEulerAngles().z, false);
            translation.set(speed, 0, 0);
            lastKey = ƒ.KEYBOARD_CODE.ESC;
          } else {

          }
        }
        break;
      case ƒ.KEYBOARD_CODE.ARROW_LEFT:
        if ((mrFudge.mtxLocal.translation.y % 1) + threshold / 2 < threshold) {
          if (isPath(-1, 0)) {
            corrector.set(mrFudge.mtxLocal.translation.x, Math.round(mrFudge.mtxLocal.translation.y), 0);
            mrFudge.mtxLocal.translation = corrector;
            fudgeRot.mtxLocal.rotateZ(180 - fudgeRot.mtxLocal.getEulerAngles().z, false);
            translation.set(-speed, 0, 0);
            lastKey = ƒ.KEYBOARD_CODE.ESC;
          } else {

          }
        }
        break;
      case ƒ.KEYBOARD_CODE.ARROW_UP:
        if ((mrFudge.mtxLocal.translation.x % 1) + threshold / 2 < threshold) {
          if (isPath(0, 1)) {
            corrector.set(Math.round(mrFudge.mtxLocal.translation.x), mrFudge.mtxLocal.translation.y, 0);
            mrFudge.mtxLocal.translation = corrector;
            fudgeRot.mtxLocal.rotateZ(90 - fudgeRot.mtxLocal.getEulerAngles().z, false);
            translation.set(0, speed, 0);
            lastKey = ƒ.KEYBOARD_CODE.ESC;
          } else {

          }
        }
        break;
      case ƒ.KEYBOARD_CODE.ARROW_DOWN:
        if ((mrFudge.mtxLocal.translation.x % 1) + threshold / 2 < threshold) {
          if (isPath(0, -1)) {
            corrector.set(Math.round(mrFudge.mtxLocal.translation.x), mrFudge.mtxLocal.translation.y, 0);
            mrFudge.mtxLocal.translation = corrector;
            fudgeRot.mtxLocal.rotateZ(270 - fudgeRot.mtxLocal.getEulerAngles().z, false);
            translation.set(0, -speed, 0);
            lastKey = ƒ.KEYBOARD_CODE.ESC;
          } else {

          }
        }
        break;
      case ƒ.KEYBOARD_CODE.ESC:
        break;
      default:
        console.log("bei der Translationszuweisung geschehen seltsame Dinge");
    }
  }

  function eatTile(_pos: ƒ.Vector2): void {
    let tempTile: ƒ.Node = grid.getChildren()[_pos.y].getChildren()[_pos.x];
    let tempMat: ƒ.ComponentMaterial = <ƒ.ComponentMaterial>tempTile.getAllComponents()[1];
    tempMat.clrPrimary.setHex("000000");
    foodCount++;
    console.log(foodCount);
  }

  function isPath(_dirX: number, _dirY: number): boolean {
    let nextX: number = Math.round(mrFudge.mtxLocal.translation.x) + _dirX;
    let nextY: number = Math.round(mrFudge.mtxLocal.translation.y) + _dirY;
    let tempTile: ƒ.Node = grid.getChildren()[nextY].getChildren()[nextX];
    let tempMat: ƒ.ComponentMaterial = <ƒ.ComponentMaterial>tempTile.getAllComponents()[1];
    if (tempMat.clrPrimary.g != 0 && tempMat.clrPrimary.g != 1) {
      return false;
    }
    return true;
  }

  function isEaten(_x: number, _y: number): boolean {
    let tempTile: ƒ.Node = grid.getChildren()[_y].getChildren()[_x];
    let tempMat: ƒ.ComponentMaterial = <ƒ.ComponentMaterial>tempTile.getAllComponents()[1];
    if (tempMat.clrPrimary.b == 0) {
      return true;
    }
    return false;
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