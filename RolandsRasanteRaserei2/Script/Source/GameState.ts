namespace Raserei {
  import ƒ = FudgeCore;
  export class GameState extends ƒ.Mutable {
    public coins: number = 0;
    public constructor() {
      super();
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {}
  }
}
