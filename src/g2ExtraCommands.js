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
 * @property {number} [w=0] - angle.
 * @example
 * g2().gndlines({x:100,y:100,r:10})
 */
g2.prototype.gndlines = function ({ x, y, w }) { return this.addCommand({ c: 'gndlines', a: arguments[0] }); }
g2.prototype.gndlines.prototype = {
    x: 0, y: 0, w: 0,
    g2(vw) {
        const { x, y, w, ls = g2.symbol.nodcolor, fs = g2.symbol.nodfill, lw = 2 } = this;
        return g2().beg({ x, y, w, scl: 1 })
            .lin({ x1: -10, y1: -5, x2: -5, y2: 0, fs, ls, lw })
            .lin({ x1: -5, y1: -5, x2: -0, y2: 0, fs, ls, lw })
            .lin({ x1: -0, y1: -5, x2: 5, y2: 0, fs, ls, lw })
            .lin({ x1: 5, y1: -5, x2: 10, y2: 0, fs, ls, lw })
            .end()
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
    g2() {
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
 * @param {object} - lin arguments object.
 * @property {number} x1 -  x1 coordinate.
 * @property {number} y1 -  y1 coordinate.
 * @property {number} x2 -  x2 coordinate.
 * @property {number} y2 -  y2 coordinate.
 * @property {string} typ -  typ |'out'|'mid'
 * @property {string} ls -  color of line
 * @property {array} ds -  [space, length] space=distance between gndlines; length=length of gndlines
 * @example
 * g2().nodfix2({x:150,y:75})
 */
g2.prototype.gndline = function ({ x1, x2, y1, y2, typ, ls }) { return this.addCommand({ c: 'gndline', a: arguments[0] }); }
g2.prototype.gndline.prototype = g2.mixin(g2.ifc.line, g2.ifc.label, {
    x1: 0, y1: 0, x2: 100, y2: 100, ls: "black",
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
                drw.gndline({ x: P1.x, y: P1.y, w: angle, ls: ls, lw, anz: anz });
                break;
            case 'out':
                min = (len - 8 * (anz + 1) / 2 - len / 2) / len;
                P1 = { x: x1 + Math.cos(angle) * len * min, y: y1 + Math.sin(angle) * len * min };
                drw.gndline({ x: P1.x, y: P1.y, w: angle, ls: ls, lw, anz: anz });
                break;
            case 'full':
                const space = ds[0]; //distance between lines
                const l = ds[1]; //length of lines
                const w2 = angle - Math.PI / 4 * 3; //Winkel der Linien
                let iEnd = len / (space) - 2;
                for (let i = 0; i < iEnd; i += 1) {
                    let x1 = x1 + (i * space + space) * Math.cos(angle);
                    let y1 = y1 + (i * space + space) * Math.sin(angle);
                    let x2 = x1 + l * Math.cos(w2);
                    let y2 = y1 + l * Math.sin(w2);
                    drw.lin({ x1: x1, y1: y1, x2: x2, y2: y2, ls: ls, lw: lw });
                }
                break;
            default:
                min = 4 * 3 / len;
                P1 = { x: x1 + Math.cos(angle) * len * min, y: y1 + Math.sin(angle) * len * min };
                const start2 = (len - 6 * 5) / len;
                const P2 = { x: x1 + Math.cos(angle) * len * start2, y: y1 + Math.sin(angle) * len * start2 }
                drw.grdlines({ x: P1.x, y: P1.y, w: angle, ls: ls, lw: lw });
                drw.grdlines({ x: P2.x, y: P2.y, w: angle, ls: ls, lw: lw });
                break;
        }
        return drw.lin({ x1, y1, x2, y2 });
    }
});
