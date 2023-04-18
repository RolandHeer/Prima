namespace Raserei {
    export class Vector {
        public x: number;
        public y: number;
        public length: number;

        constructor(_x: number, _y: number) {
            this.x = _x;
            this.y = _y;
            this.calcLength();
        }

        public static getRandom(_min: number, _max: number): Vector {               //Get a random Vector in given Range
            let tempVector: Vector = new Vector(0, 0);
            tempVector.set(_min + Math.random() * (_max - _min), _min + Math.random() * (_max - _min));
            return tempVector;
        }
        public static getDifference(_v0: Vector, _v1: Vector): Vector {             //Get the Difference Vector between 2 given Vectors
            let tempVector: Vector = new Vector(0, 0);
            tempVector.set(_v0.x - _v1.x, _v0.y - _v1.y);
            return tempVector;
        }
        public static getSum(_v0: Vector, _v1: Vector): Vector {                    //Get the resulting Vector of 2 given Vectors
            let tempVector: Vector = new Vector(0, 0);
            tempVector.set(_v0.x + _v1.x, _v0.y + _v1.y);
            return tempVector;
        }
        public static getScaled(_v: Vector, _scale: number): Vector {               //Returns a scaled Vector
            let tempVector: Vector = new Vector(0, 0);
            tempVector.set(_v.x * _scale, _v.y * _scale);
            return tempVector;
        }
        public static getLength(_vector: Vector): number {                          //Returns the length of given Vector
            let templength: number;
            templength = Math.sqrt((_vector.x * _vector.x) + (_vector.y * _vector.y));
            return templength;
        }
        public static getuberVector(_length: number, _direction: Vector): Vector {  //Returns a directional Vector with given length
            let tempVector: Vector = new Vector(_direction.x / (_direction.length), _direction.y / (_direction.length));
            tempVector = this.getScaled(tempVector, _length);
            return tempVector;
        }
        public static getRotVector(_length: number, _rot: number): Vector {     //Returns a Vector with given Rotation and given length (0° represents a Vector pointing only in negative X *(up), 90° pointing only in positive Y (right))
            return this.getuberVector(_length, new Vector(Math.sin(_rot * Math.PI / 180), -Math.cos(_rot * Math.PI / 180)));
        }
        public static getRotOfVector(_vector: Vector): number {    //returns the rotation of a Vector in the range between -180 and 180 relative to the y-axis
            if (_vector.x < 0) {
                return -(90 - (Math.atan(-_vector.y / -_vector.x) * (180 / Math.PI)));
            } else {
                return (Math.atan(-_vector.y / -_vector.x) * (180 / Math.PI)) + 90;
            }
        }

        public static getRotOfXY(_x: number, _y: number): number {    //returns the rotation of a Vector in the range between -180 and 180 relative to the y-axis
            if (_x < 0) {
                return -(90 - (Math.atan(-_y / -_x) * (180 / Math.PI)));
            } else {
                return (Math.atan(-_y / -_x) * (180 / Math.PI)) + 90;
            }
        }

        public set(_x: number, _y: number): void {
            this.x = _x;
            this.y = _y;
            this.calcLength();

        }
        public add(_addend: Vector): void {
            this.x += _addend.x;
            this.y += _addend.y;
            this.calcLength();
        }
        public clone(): Vector {
            return new Vector(this.x, this.y);
        }

        private calcLength(): void {
            this.length = Math.sqrt((this.x * this.x) + (this.y * this.y));
        }
    }
}