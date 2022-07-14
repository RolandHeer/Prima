namespace Endabgabe {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class GameState extends ƒ.Mutable {
    public coins: number = 0;

    public constructor() {
      super();
      const domVui: HTMLDivElement = document.querySelector("div#vui");
      console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {}
  }
}
