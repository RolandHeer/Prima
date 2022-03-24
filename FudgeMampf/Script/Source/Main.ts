namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let graph: ƒ.Node;
  let mrFudge: ƒ.Node;
  let speed: number = 1 / 20;
  let translation: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let corrector: ƒ.Vector3 = new ƒ.Vector3(0,0,0);
  let lastKey: ƒ.KEYBOARD_CODE;

  //let gridWidth: number = 5;
  //let gridHeight: number = 5;

  document.addEventListener("interactiveViewportStarted", <EventListener>start);
  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    graph = viewport.getBranch();
    mrFudge = graph.getChildrenByName("MrFudge")[0];
    mrFudge.mtxLocal.translation.x = 3;
    console.log("iks: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
    setupGrid();
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
    updateDirection();
    updateTranslation();
    //switch(ƒ.Keyboard.isPressedOne)
    mrFudge.mtxLocal.translate(translation);
  }

  function updateDirection(): void {
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

  function updateTranslation(): void {
    switch (lastKey) {
      case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
        if (mrFudge.mtxLocal.translation.y % 1 < 0.05) {
          mrFudge.mtxLocal.translation.set(mrFudge.mtxLocal.translation.x, Math.round(mrFudge.mtxLocal.translation.y), 0);
          console.log("x: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
          translation.set(speed, 0, 0);
        }
        break;
      case ƒ.KEYBOARD_CODE.ARROW_LEFT:
        if (mrFudge.mtxLocal.translation.y % 1 < 0.05) {
          mrFudge.mtxLocal.translation.set(mrFudge.mtxLocal.translation.x, Math.round(mrFudge.mtxLocal.translation.y), 0);
          console.log("x: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
          translation.set(-speed, 0, 0);
        }
        break;
      case ƒ.KEYBOARD_CODE.ARROW_UP:
        if (mrFudge.mtxLocal.translation.x % 1 < 0.05) {
          mrFudge.mtxLocal.translation.set(Math.round(mrFudge.mtxLocal.translation.x), mrFudge.mtxLocal.translation.y, 0);
          console.log("x: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
          translation.set(0, speed, 0);
        }
        break;
      case ƒ.KEYBOARD_CODE.ARROW_DOWN:
        if (mrFudge.mtxLocal.translation.x % 1 < 0.05) {
          mrFudge.mtxLocal.translation.set(Math.round(mrFudge.mtxLocal.translation.x), mrFudge.mtxLocal.translation.y, 0);
          console.log("x: " + mrFudge.mtxLocal.translation.x + " y: " + mrFudge.mtxLocal.translation.y);
          translation.set(0, -speed, 0);
        }
        break;
      default:
        console.log("bei der Translationszuweisung geschehen seltsame Dinge");
    }
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