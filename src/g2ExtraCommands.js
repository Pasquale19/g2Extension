"use strict"

/**
 * @author Pascal Schnabel
 * @license MIT License
 * @requires g2.core.js
 * @requires g2.ext.js
 * @typedef {g2}
 * @description Mechanical extensions. (Requires cartesian coordinates)
 * @returns {g2}
 */

g2.symbol.nodfill3 = "white";


var g2 = g2 || { prototype: {} };  // for jsdoc only ...

/**
 * fixed line symbol like ///
 * @returns {object} g2
 * @param {object} - arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @property {number} [w=0] - angle
* @property {number} ds -  [distance ,length] - space between lines, length of lines
 * @property {number} anz -  number of lines (default:4 )
 * @example
 * g2().gndlines({x:100,y:100,r:10})
 */
g2.prototype.gndlines = function ({ x, y, w }) { return this.addCommand({ c: 'gndlines', a: arguments[0] }); }
g2.prototype.gndlines.prototype = {
    x: 0, y: 0, w: 0, ds: [8, 13], anz: 4,
    g2(vw) {
        const { x, y, w, ls = g2.symbol.nodcolor, fs = g2.symbol.nodfill, lw = 2, ds, anz } = this;
        const dist = ds[0]; //distance between lines
        const len = ds[1];//length of one line
        const w2 = w - Math.PI / 4 * 3;//angle of single line
        const drw = g2();
        for (let i = 0; i < anz; i += 1) {
            let x1 = x + i * dist * Math.cos(w);
            let y1 = y + i * dist * Math.sin(w);
            let x2 = x1 + len * Math.cos(w2);
            let y2 = y1 + len * Math.sin(w2);
            drw.lin({ x1: x1, y1: y1, x2: x2, y2: y2, ls: ls, lw: lw });
        }
        drw.end();
        return drw;
    }
}

/**
 * Draw fixed node.
 * @method
 * @returns {object} g2
 * @param {object} - node arguments object.
 * @property {number} x -  x coordinate.
 * @property {number} y -  y coordinate.
 * @property {number} w -  angle
 * * @property {number} scl -  scale
 * @example
 * g2().nodfix2({x:150,y:75})
 */
g2.prototype.nodfix2 = function ({ x, y, w, scl }) { return this.addCommand({ c: 'nodfix2', a: arguments[0] }); }
g2.prototype.nodfix2.prototype = g2.mixin(g2.ifc.point, g2.ifc.circular, g2.ifc.label, {
    x: 0, y: 0, w: 0, scl: 1,
    lbloc: 'e',
    lboff: 4,
    width: 9,//width of nodifix,
    h: 12, //height
    g2(vw) {
        const { x, y, w, h, scl, width, ls = g2.symbol.nodcolor, fs = g2.symbol.nodfill3, fs_2 = '#fefefe99' } = this;
        let FG = g2().beg({ x, y, scl, w })
            .lin({ x1: -width - 5, y1: -h, x2: width + 5, y2: -h })
            .path({
                seg: [
                    { c: 'm', x: -3, y: 2 },
                    { c: 'l', x: -width, y: -h },
                    { c: 'l', x: width, y: -h },
                    { c: 'l', x: 3, y: 2 },
                    { c: 'l', x: -3, y: 2 },
                    { c: 'z' }
                ], ls, fs
            })
            .use({ grp: "pol", x: 0, y: 0, scl: 1 });
        let StepSize = width * 2 / 3;
        for (let i = -width + 2; i < width + 5; i += StepSize) {
            let l = 6;
            FG.lin({ x1: i, y1: -h, x2: i - l, y2: -h - l })
        }
        FG.end();
        return FG;
    }
});


/**
 * Draw fixed line
 * @method
 * @returns {object} g2
 * @param {object} - gndlin arguments object.
 * @property {number} x1 -  x1 coordinate.
 * @property {number} y1 -  y1 coordinate.
 * @property {number} x2 -  x2 coordinate.
 * @property {number} y2 -  y2 coordinate.
 * @property {string} typ -  typ |'out'|'mid'
 * @property {string} ls -  color of line
 * @property {array} ds -  [space, length] space=distance between gndlines; length=length of gndlines
 * @property {number} anz -  number of lines for the gndlines symbol; by default anz=4
 * @example
 * g2().gndline({x1:150,y1:75,x2:350,y2:125,typ:'out'})
 */
g2.prototype.gndline = function ({ x1, x2, y1, y2, typ, ls }) { return this.addCommand({ c: 'gndline', a: arguments[0] }); }
g2.prototype.gndline.prototype = g2.mixin(g2.ifc.line, g2.ifc.label, {
    x1: 0, y1: 0, x2: 100, y2: 100, ls: "black", lboff: "4", lbloc: "e",
    g2(vw) {
        const { x1, y1, x2, y2, lw = 1, ls = g2.symbol.nodcolor, typ = 'out', anz = 4, ds = [5, 10] } = this;
        const vec = { x: x2 - x1, y: y2 - y1 };
        const angle = Math.atan2(vec.y, vec.x);//Winkel des Vektors
        const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

        const drw = g2();
        let min, P1;
        switch (typ) {
            case 'mid':
                min = (len - 8 * (anz + 1) / 2 - len / 2) / len;
                P1 = { x: x1 + Math.cos(angle) * len * min, y: y1 + Math.sin(angle) * len * min };
                drw.gndlines({ x: P1.x, y: P1.y, w: angle, ls: ls, lw, anz: anz });
                break;
            case 'out':
                min = (len - 8 * (anz + 1) / 2 - len / 2) / len;
                P1 = { x: x1 + Math.cos(angle) * len * min, y: y1 + Math.sin(angle) * len * min };
                drw.gndlines({ x: P1.x, y: P1.y, w: angle, ls: ls, lw, anz: anz });
                console.log("out");
                break;
            case 'full':
                const space = ds[0]; //distance between lines
                const l = ds[1]; //length of lines
                const w2 = angle - Math.PI / 4 * 3; //Winkel der Linien
                let iEnd = len / (space) - 2;
                for (let i = 0; i < iEnd; i += 1) {
                    let x1f = x1 + (i * space + space) * Math.cos(angle);
                    let y1f = y1 + (i * space + space) * Math.sin(angle);
                    let x2f = x1 + l * Math.cos(w2);
                    let y2f = y1 + l * Math.sin(w2);
                    drw.lin({ x1: x1f, y1: y1f, x2: x2f, y2: y2f, ls: ls, lw: lw });
                }
                break;
            default:
                min = 4 * 3 / len;
                P1 = { x: x1 + Math.cos(angle) * len * min, y: y1 + Math.sin(angle) * len * min };
                const start2 = (len - 6 * 5) / len;
                const P2 = { x: x1 + Math.cos(angle) * len * start2, y: y1 + Math.sin(angle) * len * start2 }
                drw.gndlines({ x: P1.x, y: P1.y, w: angle, ls: ls, lw: lw });
                drw.gndlines({ x: P2.x, y: P2.y, w: angle, ls: ls, lw: lw });
                break;
        }
        return drw.lin({ x1, y1, x2, y2, lw: lw * 1.1 });
    }
});

/**
 * Draws fixed slot for slider
 * @method
 * @returns {object} g2
 * @param {object} - guide arguments object.
 * @property {number} x1 -  x1 coordinate.
 * @property {number} y1 -  y1 coordinate.
 * @property {number} x2 -  optional x2 coordinate.
 * @property {number} y2 -  optional y2 coordinate.
 * @property {number} w -  optional angle coordinate.
 *  @property {number} len -  optional length coordinate.
 *@property {number} width - width of slot; default: width=
 * @property {string} ls -  color of line
 * @property {array} ds -  [space, length] space=distance between gndlines; length=length of gndlines
 * @property {number} anz -  number of lines for the gndlines symbol; by default anz=4
 * @example
 * g2().guide({x1:150,y1:75,x2:350,y2:125,typ:'out'})
 */
g2.prototype.guide = function ({ x1, x2, y1, y2, w, ls }) { return this.addCommand({ c: 'guide', a: arguments[0] }); }
g2.prototype.guide.prototype = g2.mixin(g2.ifc.line, g2.ifc.label, {
    lbloc: 'w',
    lboff: 4,
    g2(vw) {
        const { x1, y1, x2, y2, lw = 1, ls = g2.symbol.nodcolor, anz = 4, ds = [5, 10] } = this;
        let args, vec, w, len;
        if (this.w === undefined) {
            vec = { x: x2 - x1, y: y2 - y1 };
            w = Math.atan2(vec.y, vec.x);//Winkel des Vektors            
        }
        else {
            len = Object.getOwnPropertyDescriptor(this, 'len') ? this.len : 100;
            w = this.w;//Winkel des Vektors
            vec = { x: len * Math.cos(w), y: Math.sin(w) * len };
            const w2 = Math.atan2(vec.y, vec.x);
        }
        const width = Object.getOwnPropertyDescriptor(this, 'width') ? this.width : 24;
        //calculate corner Points
        const CP1 = { x: x1 - Math.sin(w) * width / 2, y: y1 + Math.cos(w) * width / 2 };
        const CP2 = { x: CP1.x + vec.x, y: CP1.y + vec.y };
        const CP3 = { x: x1 + Math.sin(w) * width / 2, y: y1 - Math.cos(w) * width / 2 };
        const CP4 = { x: CP3.x + vec.x, y: CP3.y + vec.y };

        //start Drawing
        const drw = g2().beg({ ls: ls })
            .gndline({ x1: CP2.x, y1: CP2.y, x2: CP1.x, y2: CP1.y, lw: lw, ds, anz, typ: 'out' })
            .gndline({ x1: CP3.x, y1: CP3.y, x2: CP4.x, y2: CP4.y, lw: lw, ds, anz, typ: 'out' })
            .end();
        return drw;
    }
})


/**
 * Draws fixed slot for slider
 * @method
 * @returns {object} g2
 * @param {object} - guide arguments object.
 * @property {object} p1 - node
* @property {object} p2 - node
* @property {object} p3 - node
* @property {number} size - size of corner; default: size=45
* @property {number} side - side of corner; default: side=1
 * @property {string} ls -  color of line
 * @property {array} ds -  [space, length] space=distance between gndlines; length=length of gndlines
 * @property {number} anz -  number of lines for the gndlines symbol; by default anz=4
 * @example
 * g2().Ecke({p1:{x:0,y:0},p2:{x:100,y:0},p3:{x:50,y:50}})
 */
g2.prototype.Ecke = function ({ p1, p2, p3, w, ls }) { return this.addCommand({ c: 'Ecke', a: arguments[0] }); }
g2.prototype.Ecke.prototype = g2.mixin(g2.ifc.label, {
    lbloc: "e", lboff: 2,
    g2(vw) {
        const { p1, p2, p3, ls = "black", size = 45, side = 1, fs = "transparent" } = this;
        const alpha1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        const alpha2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        let dw = alpha2 - alpha1;
        if (side < 1)
            dw = 2 * Math.PI - dw;
        const g = g2().beg({ x: p2.x, y: p2.y, w: Math.atan2(p1.y - p2.y, p1.x - p2.x) });
        g.p().m({ x: size, y: 0 })
            //.q({x1:this.size*Math.cos(dw/2*this.side)/2,y1:this.size*Math.sin(dw/2*this.side)/2,x:this.size*Math.cos(dw*this.side),y:this.size*Math.sin(dw*this.side)})    //first Point is control point        
            .q({ x1: 0, y1: 0, x: size * Math.cos(dw * side), y: size * Math.sin(dw * side) })
            .l({ x: 0, y: 0 })
            .l({ x: size, y: 0 })
            .z()
            .fill({ fs: fs, ls: ls });
        g.end();
        return g;
    }
})

/**
 * corner between three nodes
 * @param {object} - corner shape.
 * @property {string} [p1] - referenced node id for position.
 * @property {string} [p2] - referenced node id for position2.
 * @property {string} [p] - referenced node id for position
 * @property {string} [wref1] - referenced constraint id for angle1.
 * @property {string} [wref2] - referenced constraint id for angle2.
 */
g2.prototype.corner = function ({ p1, p2, p, w, ls }) { return this.addCommand({ c: 'corner', a: arguments[0] }); }
g2.prototype.corner.prototype = {
    lbloc: "e", lboff: 2,
    g2(vw) {
        const { p1, p2, p, lw = 1, ls = g2.symbol.nodcolor, anz = 4, size = 20, fs = "black" } = this;
        const w1 = this.wref1 === undefined ? Math.atan2(p1.x - p.x, p1.y - p.y) : this.wref1.w;
        const w2 = this.wref2 === undefined ? Math.atan2(p2.x - p.x, p2.y - p.y) : this.wref2.w;
        let dw = w2 - w1;
        const angle1 = this.wref1 === undefined ? Math.atan2(p1.x - p.x, p1.y - p.y) : this.wref1.w;
        const angle2 = this.wref2 === undefined ? Math.atan2(p2.x - p.x, p2.y - p.y) : this.wref2.w;
        const drw = g2();
        drw.beg({ x: () => p.x, y: () => p.y, w: w1 });
        drw.p().m({ x: this.size, y: 0 })
            .l({ x: Math.cos(dw) * size, y: Math.sin(dw) * size })
            .l({ x: 0, y: 0 })
            .l({ x: size, y: 0 })
            .z()
            .fill({ fs: fs, ls: ls, lw: 2, lc: 'round', lj: 'round' });
        drw.end();

        return drw;


    }
}