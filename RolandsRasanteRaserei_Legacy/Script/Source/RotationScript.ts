namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class RotationScript extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(RotationScript);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "RotationScript added to ";

    private mtx: ƒ.Matrix4x4;
    private rotationSpeed: number = 4;

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          //ƒ.Debug.log(this.message, this.node);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case ƒ.EVENT.RENDER_PREPARE:
          this.mtx.rotate(ƒ.Vector3.Y(this.rotationSpeed));
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          this.mtx = this.node.getComponent(ƒ.ComponentMesh).mtxPivot;
          this.mtx.rotate(ƒ.Vector3.Y(Math.random()*360));
          this.node.addEventListener(ƒ.EVENT.RENDER_PREPARE, this.hndEvent);
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}