namespace Script {
    export class Ghost {

        //private mrFudge: MrFudge;

        constructor(_node: ƒ.Node, _mrFudge: MrFudge) {
            this.setup(_node);
            //this.mrFudge = _mrFudge;
        }

        private setup(_node: ƒ.Node): void {
            let tempMaterial: ƒ.Material = new ƒ.Material("ghostMat", ƒ.ShaderLit);
            let tempMesh: ƒ.MeshSphere = new ƒ.MeshSphere("ghostSphere", 6, 6);

            let tempMaterialComp: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(tempMaterial);
            tempMaterialComp.clrPrimary = ƒ.Color.CSS("#ed0043");
            let tempMeshComp: ƒ.ComponentMesh = new ƒ.ComponentMesh(tempMesh);
            tempMeshComp.mtxPivot.scale(new ƒ.Vector3(0.8, 0.8, 0.8));
            let tempTransformComp: ƒ.ComponentTransform = new ƒ.ComponentTransform();

            _node.addComponent(tempTransformComp);
            _node.addComponent(tempMaterialComp);
            _node.addComponent(tempMeshComp);
            _node.mtxLocal.translation = new ƒ.Vector3(5, 5, 0);
        }
    }
}