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
        const { x, y, w, h, scl, width, ls = g2.symbol.nodcolor, fs = g2.symbol.nodfill, fs_2 = '#fefefe99' } = this;
        let FG = g2().beg({ x, y, scl, w })
            .lin({ x1: 3, y1: 2, x2: width, y2: -h })
            .lin({ x1: -3, y1: 2, x2: -width, y2: -h })
            .lin({ x1: -width - 5, y1: -h, x2: width + 5, y2: -h })
            .use({ grp: "pol", x: 0, y: 0, scl: 1 });
        let StepSize = width * 2 / 3;
        for (let i = -width + 2; i < width + 5; i += StepSize) {
            let l = 6;
            FG.lin({ x1: i, y1: -h, x2: i - l, y2: -h - l })
        }
        FG.end();
        return FG;
    }
})

