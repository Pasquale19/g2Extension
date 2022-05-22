/**
 * g2.core (c) 2013-22 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @link https://github.com/goessner/g2
 * @typedef {g2}
 * @param {object} [opts] Custom options object.
 * @description Create a 2D graphics command queue object. Call without using 'new'.
 * @returns {g2}
 * @example
 * const ctx = document.getElementById("c").getContext("2d");
 * g2()                                   // Create 'g2' instance.
 *     .lin({x1:50,y1:50,x2:100,y2:100})  // Append ...
 *     .lin({x1:100,y1:100,x2:200,y2:50}) // ... commands.
 *     .exe(ctx);                         // Execute commands addressing canvas context.
 */
 "use strict"

function g2(opts) {
    let o = Object.create(g2.prototype);
    o.commands = [];
    if (opts) Object.assign(o, opts);
    return o;
}

g2.prototype = {
    addCommand({ c, a }) {
        if (a && Object.getPrototypeOf(a) === Object.prototype) {  // modify only pure argument objects 'a' .. !
            for (const key in a) {
                if (!Object.getOwnPropertyDescriptor(a, key).get   // if 'key' is no getter ...
                    && key[0] !== '_'                              // and no private property ... 
                    && typeof a[key] === 'function') {             // and a function ... make it a getter
                    Object.defineProperty(a, key, { get: a[key], enumerable: true, configurable: true, writabel: false });
                }
                if (typeof a[key] === 'string' && a[key][0] === '@') {  // referring values by neighbor id's
                    const refidIdx = a[key].indexOf('.');
                    const refid = refidIdx > 0 ? a[key].substr(1, refidIdx - 1) : '';
                    const refkey = refid ? a[key].substr(refidIdx + 1) : '';
                    const refcmd = refid ? () => this.commands.find((cmd) => cmd.a && cmd.a.id === refid) : undefined;

                    if (refcmd)
                        Object.defineProperty(a, key, {
                            get: function () {
                                const rc = refcmd();
                                return rc && (refkey in rc.a) ? rc.a[refkey] : 0;
                            },
                            enumerable: true,
                            configurable: true,
                            writabel: false
                        });
                }
            }
            if (g2.prototype[c].prototype) Object.setPrototypeOf(a, g2.prototype[c].prototype);
        }
        this.commands.push(arguments[0]);
        return this;
    },

    /**
     * Draw arc by center point, radius, start angle and angular range.
     * @method
     * @returns {object} g2
     * @param {object} - arc arguments object.
     * @property {number} x - x-value center.
     * @property {number} y - y-value center.
     * @property {number} r - radius.
     * @property {number} [w=0] - start angle (in radian).
     * @property {number} [dw=2*pi] - angular range in Radians.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {string} [lc=butt] - line cap [`butt`, `round`, `square`].
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @example
     * g2().arc({x:300,y:400,r:390,w:-Math.PI/4,dw:-Math.PI/2})
     *     .exe(ctx);
     */
    arc({ x, y, r, w, dw }) { return this.addCommand({ c: 'arc', a: arguments[0] }); },

    /**
     * Begin subcommands. Current state is saved.
     * Optionally apply transformation or style properties.
     * @method
     * @returns {object} g2
     * @param {object} - beg arguments object.
     * @property {number} [x = 0] - translation value x.
     * @property {number} [y = 0] - translation value y.
     * @property {number} [w = 0] - rotation angle (in radians).
     * @property {number} [scl = 1] - scale factor.
     * @property {array} [matrix] - matrix instead of single transform arguments (SVG-structure [a,b,c,d,x,y]).
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - line stroke color.
     * @property {string} [lw=1] - line width.
     * @property {string} [lc=butt] - line cap [`butt`, `round`, `square`].
     * @property {string} [lj='miter'] - line join [`round`, `bevel`, `miter`].
     * @property {number} [ml=10] - miter limit.
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @property {string} [thal='start']
     * - text horizontal alignment [`'start'`,`'end'`,`'left'`,`'right'`,`'center'`]
     * @property {string} [tval='alphabetic']
     * - text vertival alignment [`'top'`,`'hanging'`,`'middle'`,`'alphabetic'`,`'ideographic'`,`'bottom'`]
     * @property {string} [font='normal 14px serif'] -
     * [Font]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font}
     * [styling]{@link https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-font}
     */
    beg({ x, y, w, scl, matrix } = {}) { return this.addCommand({ c: 'beg', a: arguments[0] }); },

    /**
     * Draw rectangular box by center point, width and height.
     * `box` is the sophisticated `rec`, as it can be placed by center and get rotated.
     * @method
     * @returns {object} g2
     * @param {object} - rectangle arguments object.
     * @property {number} x - x-value upper left corner.
     * @property {number} y - y-value upper left corner.
     * @property {number} w - angle in [rad].
     * @property {number} b - width.
     * @property {number} h - height.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {string} [lj='miter'] - line join [`round`, `bevel`, `miter`].
     * @property {number} [ml=10] - miter limit.
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @example
     * g2().box({x:100,y:80,b:40,h:30}) // Draw rectangle.
     */
    box({ x=0, y=0, w=0, b, h }) { return this.addCommand({ c: 'box', a: arguments[0] }); },

    /**
     * Draw circle by center and radius.
     * @method
     * @returns {object} g2
     * @param {object} - circle arguments object.
     * @property {number} x - x-value center.
     * @property {number} y - y-value center.
     * @property {number} r - radius.
     * @property {number} w - angle.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {array} [sh=[0,0,0,'transparent']]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @example
     * g2().cir({x:100,y:80,r:20})  // Draw circle.
     */
    cir({ x, y, r, w }) { return this.addCommand({ c: 'cir', a: arguments[0] }); },

     /**
     * Clear viewport region.<br>
     * @method
     * @returns {object} g2
     */
    clr() { return this.addCommand({ c: 'clr' }); },

    /**
     * Delete all commands beginning from `idx` to end of command queue.
     * @method
     * @returns {object} g2
     */
    del(idx) { this.commands.length = idx || 0; return this; },

    /**
     * Draw ellipse by center and radius for x and y.
     * @method
     * @returns {object} g2
     * @param {object} - ellipse argument object.
     * @property {number} x - x-value center.
     * @property {number} y - y-value center.
     * @property {number} rx - radius x-axys.
     * @property {number} ry - radius y-axys.
     * @property {number} w - start angle in radiant.
     * @property {number} dw - angular range in radiant.
     * @property {number} rot - rotation angle in radiant.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @example
     * :g2().ell({x:100,y:80,rx:20,ry:30,w:0,dw:2*Math.PI/4,rot:1})  // Draw circle.
     */
    ell({ x, y, rx, ry, w, dw, rot }) { return this.addCommand({ c: 'ell', a: arguments[0] }); },

    /**
     * End subcommands. Previous state is restored.
     * @method
     * @returns {object} g2
     * @param {object} - end arguments object.
     */
    end() { // ignore 'end' commands without matching 'beg'
        let myBeg = 1, idx, cmd;
        for (idx = this.commands.length - 1; idx >= 0; idx--) {
            cmd = this.commands[idx];
            if (cmd.c === 'beg') myBeg--;
            else if (cmd.c === 'end') myBeg++; // care about nested beg...end blocks ...
            if (myBeg === 0) break;            // matching `beg` found ...
        }
        return (myBeg === 0) ? this.addCommand({ c: 'end' }) : this;
    },

    /**
     * Execute g2 commands. It does so automatically and recursively with 'use'ed commands.
     * @method
     * @returns {object} g2
     * @param {object} ctx Context.
     */
    exe(ctx) {
        const handler = g2.handler(ctx);
        if (handler && handler.init(this)) {
            if (handler.exe)
                handler.exe(this.commands)
            else
                this.exeCommands(handler, this.commands, this.view)
        }
        return this;
    },
    // helpers ...
    async exeCommands(hdlr, commands, view) {
        if (commands)
            for (const cmd of commands) {
                // handler supports command name ..
                if (cmd.c && hdlr[cmd.c]) { 
                    const res = hdlr[cmd.c](cmd.a);
                    if (res && res instanceof Promise)
                        await res;
                }
                // support chained `g2` methods
                if (cmd.a?.g2_arr) {
                    for (const fn of cmd.a.g2_arr)
                        this.exeCommands(hdlr, fn.bind(cmd.a)(view)?.commands, view);
                }
                else if (cmd.a?.g2) {
                    this.exeCommands(hdlr, cmd.a.g2(view)?.commands, view);
                }
                // cmd.g2 exists and provides a `commands` array, so execute it.
                if (cmd.g2)
                    this.exeCommands(hdlr, cmd.g2.commands, view);

            }
        return this;
    },

    /**
     * Draw grid.
     * @method
     * @returns {object} g2
     * @param {object} - grid arguments object.
     * @property {string} [color=#ccc] - change color.
     * @property {number} [size=20] - change space between lines.
     */
    grid({ color, size } = {}) { return this.addCommand({ c: 'grid', a: arguments[0] }); },

    /**
     * Draw image.
     * This also applies to images of reused g2 objects. If an image can not be loaded, it will be replaced by a broken-image symbol.
     * @method
     * @returns {object} g2
     * @param {object} - image arguments object.
     * @property {string} uri - image uri or data:url.
     * @property {number} [x = 0] - x-coordinate of image (upper left).
     * @property {number} [y = 0] - y-coordinate of image (upper left).
     * @property {number} [b = image.width] - width.
     * @property {number} [h = image.height] - height.
     * @property {number} [sx = 0] - source x-offset.
     * @property {number} [sy = 0] - source y-offset.
     * @property {number} [sb = image.width] - source width.
     * @property {number} [sh = image.height] - source height.
     * @property {number} [xoff = 0] - x-offset.
     * @property {number} [yoff = 0] - y-offset.
     * @property {number} [w = 0] - rotation angle (about upper left, in radians).
     * @property {number} [scl = 1] - image scaling.
     */
    img({ uri, x, y, b, h, sx, sy, sb, sh, xoff, yoff, w, scl }) { return this.addCommand({ c: 'img', a: arguments[0] }); },

    /**
     * Call function, invoke interim g2 commands or invoke `g2()` method of object 
     * between commands of the command queue.
     * @method
     * @returns {object} g2
     * @param {function} - ins argument function.
     * @example
     * const node = {
     *      fill:'lime',
     *      g2() { return g2().cir({x:160,y:50,r:15,fs:this.fill,lw:4,sh:[8,8,8,"gray"]}) }
     * };
     * let color = 'red';
     * g2().cir({x:40,y:50,r:15,fs:color,lw:4,sh:[8,8,8,"gray"]})   // draw red circle.
     *     .ins(()=>{color='green'})                                // color is now green.
     *     .cir({x:80,y:50,r:15,fs:color,lw:4,sh:[8,8,8,"gray"]})   // draw green circle.
     *     .ins((g) =>                                              // draw orange circle
     *          g.cir({x:120, y:50, r:15, fs:'orange', lw:4,sh:[8,8,8,"gray"]}))
     *     .ins(node)                                               // draw node.
     *     .exe(ctx)                                                // render to canvas context.
     */
    ins(o) {
        return (typeof o === 'function') ? (o(this) || this)
             : (typeof o === 'object' && o instanceof g2) ? this.addCommand({c:'ins',g2:o})
             : this;
    },

    /**
     * Draw line by start point and end point.
     * @method
     * @returns {object} g2
     * @param {object} - line arguments object.
     * @property {number} x1 - start x coordinate.
     * @property {number} y1 - start y coordinate.
     * @property {number} x2 - end x coordinate.
     * @property {number} y2 - end y coordinate.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {string} [lc=butt] - line cap [`butt`, `round`, `square`].
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @example
     * g2().lin({x1:10,x2:10,y1:190,y2:10}) // Draw line.
     */
    lin({ x1, y1, x2, y2 }) { return this.addCommand({ c: 'lin', a: arguments[0] }); },

    /**
     * Draw path via path commands similar to SVG commands.
     * @method
     * @returns {object} g2
     * @param {object} - path arguments object.
     * @property {string} [d = undefined] - SVG path definition data string.
     * @property {array} [seg = undefined] - path segments array
     * @property {number} x - start x coordinate.
     * @property {number} y - start y coordinate.
     * @property {number} w - angle.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {string} [lc=butt] - line cap [`butt`, `round`, `square`].
     * @property {string} [lj='miter'] - line join [`round`, `bevel`, `miter`].
     * @property {number} [ml=10] - miter limit.
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @example
     * g2().ply({pts:[100,50,120,60,80,70]}),
     *     .ply({pts:[150,60],[170,70],[130,80]],closed:true}),
     *     .ply({pts:[{x:160,y:70},{x:180,y:80},{x:140,y:90}]}),
     *     .exe(ctx);
     */
    path(args)  { return this.addCommand({ c: 'path', a: args }); },

    /**
     * Draw polygon by points.
     * Command expects sequence of x/y-coordinates as a flat array [x,y,...],
     * array of [[x,y],...] arrays or array of [{x,y},...] objects.
     * @method
     * @returns {object} g2
     * @param {object} - polygon arguments object.
     * @property {array} pts - array of points.
     * @property {string} [format] - format string of points array structure. Useful for handing over initial empty points array. One of `['x,y','[x,y]','{x,y}']`. Has precedence over `pts` content.
     * @property {boolean} [closed = false]
     * @property {number} x - start x coordinate.
     * @property {number} y - start y coordinate.
     * @property {number} w - angle.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {string} [lc=butt] - line cap [`butt`, `round`, `square`].
     * @property {string} [lj='miter'] - line join [`round`, `bevel`, `miter`].
     * @property {number} [ml=10] - miter limit.
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @example
     * g2().ply({pts:[100,50,120,60,80,70]}),
     *     .ply({pts:[150,60],[170,70],[130,80]],closed:true}),
     *     .ply({pts:[{x:160,y:70},{x:180,y:80},{x:140,y:90}]}),
     *     .exe(ctx);
     */
    ply({ pts, format, closed, x, y, w }) {
        arguments[0].pts = g2.poly.proxy(arguments[0].pts, x, y, w);
        return this.addCommand({ c: 'ply', a: arguments[0] });
    },

    /**
     * Draw rectangle by anchor point and dimensions.
     * @method
     * @returns {object} g2
     * @param {object} - rectangle arguments object.
     * @property {number} x - x-value upper left corner.
     * @property {number} y - y-value upper left corner.
     * @property {number} b - width.
     * @property {number} h - height.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {string} [lj='miter'] - line join [`round`, `bevel`, `miter`].
     * @property {number} [ml=10] - miter limit.
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @example
     * g2().rec({x:100,y:80,b:40,h:30}) // Draw rectangle.
     */
    rec({ x, y, b, h }) { return this.addCommand({ c: 'rec', a: arguments[0] }); },

    /**
     * Draw text string at anchor point.
     * @method
     * @returns {object} g2
     * @param {object} - text arguments object.
     * @property {string} str - text string.
     * @property {number} [x=0] - x coordinate of text anchor position.
     * @property {number} [y=0] - y coordinate of text anchor position.
     * @property {number} [w=0] - w Rotation angle about anchor point with respect to positive x-axis.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @property {string} [thal='start']
     * - Text horizontal alignment [`'start'`,`'end'`,`'left'`,`'right'`,`'center'`]
     * @property {string} [tval='alphabetic']
     * - Text vertival alignment [`'top'`,`'hanging'`,`'middle'`,`'alphabetic'`,`'ideographic'`,`'bottom'`]
     * @property {string} [font='normal 14px serif'] -
     * [Font]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font}
     * [styling]{@link https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-font}
     */
    txt({ str, x, y, w }) { return this.addCommand({ c: 'txt', a: arguments[0] }); },

    /**
     * Reference g2 graphics commands from another g2 object or a predefined g2.symbol.
     * With this command you can reuse instances of grouped graphics commands
     * while applying a similarity transformation and style properties on them.
     * In fact you might want to build custom graphics libraries on top of that feature.
     * @method
     * @returns {object} g2
     * @param {object} - use arguments object.
     * @see {@link https://github.com/goessner/g2/blob/master/docs/api/g2.ext.md#g2symbol--object predefined symbols in g2.ext}
     * @property {object | string} grp - g2 source object or symbol name found in 'g2.symbol' namespace.
     * @property {number} [x=0] - translation value x.
     * @property {number} [y=0] - translation value y.
     * @property {number} [w=0] - rotation angle (in radians).
     * @property {number} [scl=1] - scale factor.
     * @property {string} [fs=transparent] - fill color.
     * @property {string} [ls=black] - stroke color.
     * @property {string} [lw=1] - line width.
     * @property {string} [lc=butt] - line cap [`butt`, `round`, `square`].
     * @property {string} [lj='miter'] - line join [`round`, `bevel`, `miter`].
     * @property {number} [ml=10] - miter limit.
     * @property {array} [ld=[]] - line dash array.
     * @property {array} [sh=[0,0,0,"transparent"]]
     * shadow values [`x-offset`,`y-offset`,`blur`,`color`],
     * @property {string} [thal='start']
     * - Text horizontal alignment [`'start'`,`'end'`,`'left'`,`'right'`,`'center'`]
     * @property {string} [tval='alphabetic']
     * - Text vertival alignment [`'top'`,`'hanging'`,`'middle'`,`'alphabetic'`,`'ideographic'`,`'bottom'`]
     * @property {string} [font='normal 14px serif'] -
     * [Font]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font}
     * [styling]{@link https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-font}
     * @example
     * g2.symbol.cross = g2().lin({x1:5,y1:5,x2:-5,y2:-5}).lin({x1:5,y1:-5,x2:-5,y2:5});  // Define symbol.
     * g2().use({grp:"cross",x:100,y:100})  // Draw cross at position 100,100.
     */
    use({ grp, x, y, w, scl }) {
        if (grp && grp !== this) {     // avoid self reference ..
            const group = grp instanceof g2 ? grp
                        : (typeof grp === "string" && grp in g2.symbol) ? g2.symbol[grp]
                        : g2.symbol['unknown'];
            const cmd = { 
                c: 'use', 
                a: arguments[0],
                g2: g2().beg(arguments[0])
                        .ins(group)
                        .end()
            }

            this.addCommand(cmd);
        }
        return this;
    },

    /**
     * Set the view by placing origin coordinates and scaling factor in device units
     * and optionally make viewport cartesian.
     * @method
     * @returns {object} g2
     * @param {object} - view arguments object.
     * @property {number} [scl=1] - absolute scaling factor.
     * @property {number} [x=0] - x-origin in device units.
     * @property {number} [y=0] - y-origin in device units.
     * @property {boolean} [cartesian=false] - set cartesian flag.
     */
    view({ scl, x, y, cartesian }) { return this.addCommand({ c: 'view', a: (this.view=arguments[0]) }); }
};

// statics
g2.defaultStyle = { fs: 'transparent', ls: '#000', lw: 1, lc: "butt", lj: "miter", ld: [], ml: 10, sh: [0, 0], lsh: false, font: '16px serif', thal: 'start', tval: 'alphabetic' };
g2.styleRex = /^(fs|ls|lw|lc|lj|ld|ldoff|ml|sh|lsh|font|thal|tval)([-0-9].*)?$/,

g2.symbol = {
    unknown: g2().cir({ r: 12, fs: 'orange' }).txt({ str: '?', thal: 'center', tval: 'middle', font: 'bold 20pt serif' })
};
g2.handler = function (ctx) {
    let hdl;
    for (let h of g2.handler.factory)
        if ((hdl = h(ctx)) !== false)
            return hdl;
    return false;
}
g2.handler.factory = [];

/**
 * Replacement for Object.assign, as it does not assign getters and setter properly ...
 * See https://github.com/tc39/proposal-object-getownpropertydescriptors
 * See https://medium.com/@benastontweet/mixins-in-javascript-700ec81f5e5c
 * Shallow copy of prototypes (think interfaces)
 * create 
 * @private
 */
g2.mixin = function mixin(...protos) {
    const mix = {g2_arr:[]};

    for (const p of protos) {
        if (p) {
            Object.defineProperties(mix, Object.getOwnPropertyDescriptors(p));
            if ('g2' in p) {  // create call chain of multiple g2-methods. Order controlled by g2_level.
                p.g2.level = p.g2_level || 0;
                mix.g2_arr.push(p.g2);
            }
        }
    }

    if ('g2' in mix) {
        delete mix.g2;
        mix.g2_arr.sort((a,b) => a.level - b.level);
    }
    return mix;
}

// =======================================
// Minimal content extracted from poly2.js
// =======================================

g2.poly = globalThis.poly2 || {};

/**
 * Polygon data arrays of different structures are supported:
 * * `[x1,y1,x2,y2,...,xn,yn]` ... flat array of alternating x,y coordinates.
 * * `[[x1,y1],[x2,y2],...,[xn,yn]]` ... array of arrays of x,y coordinates.
 * * `[{x:x1,y:y1},{x:x2,y:y2},...,{x:xn,y:yn}]` ... array of {x,y} objects holding coordinates (this is the target polygon structure!)
 * A Proxy object - behaving as if it is filled with `{x,y}` objects - is returned.
 * Proxy objects for polygon data are designed to be read only. So modification must be applied to the original array. 
 * @method
 * @param {array} poly - Array of points.
 * @param {number} x - translation x-coordinate.
 * @param {number} y - translation y-coordinate.
 * @param {number} w - rotation angle in radians.
 * @return {proxy | undefined}
 * @example
 * const arr = poly2.proxy([2,3,5,6,7,8]);
 * for (let i=0; i<arr.length; i++)
 *     console.log(arr[i].x+','+arr[i].y);
 */
 g2.poly.proxy = g2.poly.proxy || function(poly, x, y, w) {
    if (Array.isArray(poly) && poly.length > 1) {
        const ply = typeof poly[0] === "number" ? poly2.proxy.flat(poly)
                  : Array.isArray(poly[0]) && typeof poly[0][0] === "number" && poly[0].length >= 2 ? g2.poly.proxy.arr(poly)
                  : poly;
        return  (x || y || w) ? g2.poly.proxy.trf(ply,{x,y,w}) : ply;
    }
}
/**
 * Flat array of alternating x,y coordinates:
 * `[x1,y1,x2,y2,...,xn,yn]` ... 
 * @method
 * @param {array} poly - Array of alternating coordinates.
 * @return {proxy} Object for accessing `{x,y}` points instead.
 */
 g2.poly.proxy.flat = g2.poly.proxy.flat || function(poly) {
    const points = new Array(~~(poly.length/2));
    points[Symbol.iterator] = function() {
        let index = 0;
        return {
            next() { 
                return index < points.length 
                    ? { value: { x:poly[index*2], y:poly[(index++)*2+1] },
                        done: false }
                    : { done: true };
            }
        }
    }
    return new Proxy(poly, {
        get: (pts, key) => {
            if (key === Symbol.iterator)
                return points[Symbol.iterator].bind(points);
            else if (!isNaN(+key))
                return {x:pts[key*2],y:pts[key*2+1]};
            else if (key === 'length')
                return  ~~(pts.length/2);
            else
                return pts[key];
        }
    });
}
/**
 * Array of arrays of x,y coordinates:
 * `[[x1,y1],[x2,y2],...,[xn,yn]]` ... 
 * @method
 * @param {array} poly - Array of arrays of x,y coordinates.
 * @return {proxy} Object for accessing `{x,y}` points instead.
 */
 g2.poly.proxy.arr = g2.poly.proxy.arr || function(poly) {
    const points = new Array(poly.length);
    points[Symbol.iterator] = function() {
        let index = 0;
        return {
            next() { 
                return index < points.length 
                    ? { value: { x:poly[index][0], y:poly[index++][1] },
                        done: false }
                    : { done: true };
            }
        }
    }
    return new Proxy(poly, {
        get: (pts, key) => {
            if (key === Symbol.iterator)
                return points[Symbol.iterator].bind(points);
            else if (!isNaN(+key))
                return {x:pts[key][0],y:pts[key][1]};
            else
                return pts[key];
        }
    });
}
/**
 * Accessing transformed `{x,y}` points.
 * `[trf*{x,y}_0,trf*{x,y}_1,...,trf*{x,y}_n]` ... 
 * @method
 * @param {array} poly - Array or Proxy holding `{x,y}` points.
 * @param {number} w - rotation angle in radians.
 * @param {number} x - translation x-coordinate.
 * @param {number} y - translation y-coordinate.
 * @return {proxy} Object for accessing rotated `{x,y}` points.
 */
 g2.poly.proxy.trf = g2.poly.proxy.trf || function(poly,{w=0,x=0,y=0}) {
    if (w || x || y) {
        const points = new Array(poly.length);
        const sw = Math.sin(w), cw = Math.cos(w);

        points[Symbol.iterator] = function() {
            let index = 0;
            return {
                next() {
                    if (index < points.length) {
                        const p = poly[index++];
                        return { value: {x: p.x*cw - p.y*sw + x, y: p.x*sw + p.y*cw + y}, done: false };
                    }
                    return { done: true };
                }
            }
        }
        return new Proxy(poly, {
            get: (pts, key) => {
                if (key === Symbol.iterator)
                    return points[Symbol.iterator].bind(points);
                else if (!isNaN(+key)) {
                    const p = pts[+key];
                    return {x: p.x*cw - p.y*sw + x, y: p.x*sw + p.y*cw + y};
                }
                else
                    return pts[key];
            }
        });
    }
    return poly;  // no transform ...
}

// ==========================
// Obsolete ...
// ==========================

/**
 * Begin new path.
 * @method
 * @returns {object} g2
 */
 g2.prototype.p = function() { return this.addCommand({ c: 'p' }); },

/**
 * Close current path by straight line.
 * @method
 * @returns {object} g2
 */
 g2.prototype.z = function() { return this.addCommand({ c: 'z' }); },

/**
 * Move to point.
 * @method
 * @returns {object} g2
 * @param {object} - move arguments object.
 * @property {number} x - move to x coordinate
 * @property {number} y - move to y coordinate
 */
 g2.prototype.m = function({ x, y }) { return this.addCommand({ c: 'm', a: arguments[0] }); },

/**
 * Create line segment to point.
 * @method
 * @returns {object} g2
 * @param {object} - line segment argument object.
 * @property {number} x - x coordinate of target point.
 * @property {number} y - y coordinate of target point.
 * @example
 * g2().p()             // Begin path.
 *     .m({x:0,y:50})   // Move to point.
 *     .l({x:300,y:0})  // Line segment to point.
 *     .l({x:400,y:100}) // ...
 *     .stroke()        // Stroke path.
 */
 g2.prototype.l = function({ x, y }) { return this.addCommand({ c: 'l', a: arguments[0] }); },

/**
 * Create quadratic bezier curve segment to point.
 * @method
 * @returns {object} g2
 * @param {object} - quadratic curve arguments object.
 * @property {number} x1 - x coordinate of control point.
 * @property {number} y1 - y coordinate of control point.
 * @property {number} x - x coordinate of target point.
 * @property {number} y - y coordinate of target point.
 * @example
 * g2().p()                           // Begin path.
 *     .m({x:0,y:0})                  // Move to point.
 *     .q({x1:200,y1:200,x:400,y:0})  // Quadratic bezier curve segment.
 *     .stroke()                      // Stroke path.
 */
 g2.prototype.q = function({ x1, y1, x, y }) { return this.addCommand({ c: 'q', a: arguments[0] }); },

/**
 * Create cubic bezier curve to point.
 * @method
 * @returns {object} g2
 * @param {object} - cubic curve arguments object.
 * @property {number} x1 - x coordinate of first control point.
 * @property {number} y1 - y coordinate of first control point.
 * @property {number} x2 - x coordinate of second control point.
 * @property {number} y2 - y coordinate of second control point.
 * @property {number} x - x coordinate of target point.
 * @property {number} y - y coordinate of target point.
 * @example
 * g2().p()                        // Begin path.
 *     .m({x:0,y:100})             // Move to point.
 *     .c({x1:100,y1:200,x2:200,y2:0,x:400,y:100}) // Create cubic bezier curve.
 *     .stroke()                   // Stroke path.
 *     .exe(ctx);                  // Render to canvas context.
 */
 g2.prototype.c = function({ x1, y1, x2, y2, x, y }) { return this.addCommand({ c: 'c', a: arguments[0] }); },

/**
 * Draw arc with angular range to target point.
 * @method
 * @returns {object} g2
 * @param {object} - arc arguments object.
 * @property {number} dw - angular range in radians.
 * @property {number} x - x coordinate of target point.
 * @property {number} y - y coordinate of target point.
 * @example
 * g2().p()            // Begin path.
 *     .m({x:50,y:50})       // Move to point.
 *     .a({dw:2,x:300,y:100})   // Create arc segment.
 *     .stroke()       // Stroke path.
 *     .exe(ctx);      // Render to canvas context.
 */
 g2.prototype.a = function({ dw, x, y }) {
    const prvcmd = this.commands[this.commands.length - 1];
    g2.cpyProp(prvcmd.a, 'x', arguments[0], '_xp');
    g2.cpyProp(prvcmd.a, 'y', arguments[0], '_yp');
    return this.addCommand({ c: 'a', a: arguments[0] });
},

/**
 * Stroke the current path or path object.
 * @method
 * @returns {object} g2
 * @param {object} - stroke arguments object.
 * @property {string} [d = undefined] - SVG path definition string. Current path is ignored then.
 */
 g2.prototype.stroke = function({ d } = {}) { return this.addCommand({ c: 'stroke', a: arguments[0] }); },

/**
 * Fill the current path or path object.
 * @method
 * @returns {object} g2
 * @param {object} - fill arguments object.
 * @property {string} [d = undefined] - SVG path definition string. Current path is ignored then.
 */
 g2.prototype.fill = function({ d } = {}) { return this.addCommand({ c: 'fill', a: arguments[0] }); },

/**
 * Shortcut for stroke and fill the current path or path object.
 * In case of shadow style, only the path interior creates shadow, not also the path contour.
 * @method
 * @returns {object} g2
 * @param {object} - drw arguments object.
 * @property {string} [d = undefined] - SVG path definition string.  Current path is ignored then.
 */
 g2.prototype.drw = function({ d, lsh } = {}) { return this.addCommand({ c: 'drw', a: arguments[0] }); },

/**
 * Get index of command resolving 'callbk' to 'true' starting from end of the queue walking back.<br>
 * Similar to 'Array.prototype.findIndex', only working reverse.
 * @private
 */
 g2.cmdIdxBy = function (cmds, callbk) {
    for (let i = cmds.length - 1; i >= 0; i--)
        if (callbk(cmds[i], i, cmds))
            return i;
    return false;  // command with index '0' signals 'failing' ...
};

/**
 * Copy properties from neighbours, even as getters .. a useful part of the above ..
 * @private
 */
g2.cpyProp = function (from, fromKey, to, toKey, deflt=0) {
    const src = Object.getOwnPropertyDescriptor(from, fromKey) || { value: deflt, writable: true, enumerable: true, configurable: true };
    Object.defineProperty(to, toKey, src);
}

// predefined polyline/spline point iterators
g2.pntIterator = {
    "x,y": function (pts) {
        function pitr(i) { return { x: pts[2 * i], y: pts[2 * i + 1] }; };
        Object.defineProperty(pitr, 'len', { get: () => pts.length / 2, enumerable: true, configurable: true, writabel: false });
        return pitr;
    },
    "[x,y]": function (pts) {
        function pitr(i) { return pts[i] ? { x: pts[i][0], y: pts[i][1] } : undefined; };
        Object.defineProperty(pitr, 'len', { get: () => pts.length, enumerable: true, configurable: true, writabel: false });
        return pitr;
    },
    "{x,y}": function (pts) {
        function pitr(i) { return pts[i]; };
        Object.defineProperty(pitr, 'len', { get: () => pts.length, enumerable: true, configurable: true, writabel: false });
        return pitr;
    }
};
g2.pntItrOf = function (pts) {
    return !(pts && pts.length) ? undefined
        : typeof pts[0] === "number" ? g2.pntIterator["x,y"](pts)
            : Array.isArray(pts[0]) && pts[0].length >= 2 ? g2.pntIterator["[x,y]"](pts)
                : typeof pts[0] === "object" && "x" in pts[0] && "y" in pts[0] ? g2.pntIterator["{x,y}"](pts)
                    : undefined;
};

/**
 * g2.ext (c) 2015-22 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @requires g2.core.js
 * @typedef {g2}
 * @description Advanced symbols and prototypes for g2.
 * @returns {g2}
 */

 "use strict"

//var g2 = g2 || { prototype: {} };  // for jsdoc only ...

// constants for element selection / editing
g2.NONE = 0x0; g2.OVER = 0x1; g2.DRAG = 0x2; g2.EDIT = 0x4;

/**
 * Command prototype interfaces
 */
g2.ifc = {}

// point-like commands interface
g2.ifc.point = {
    get x()  { return Object.getOwnPropertyDescriptor(this, 'p') ? this.p.x : 0; },
    set x(q) { if (Object.getOwnPropertyDescriptor(this, 'p')) this.p.x = q; },
    get y()  { return Object.getOwnPropertyDescriptor(this, 'p') ? this.p.y : 0; },
    set y(q) { if (Object.getOwnPropertyDescriptor(this, 'p')) this.p.y = q; },
    drag({ x, y }) {
        this.x = x;
        this.y = y;
    }
}

// line-like commands interface
g2.ifc.line = {
    get x1() { return Object.getOwnPropertyDescriptor(this, 'p1') ? this.p1.x : 0; },
    get y1() { return Object.getOwnPropertyDescriptor(this, 'p1') ? this.p1.y : 0; },
    get x2() { return Object.getOwnPropertyDescriptor(this, 'p2') ? this.p2.x : 0; },
    get y2() { return Object.getOwnPropertyDescriptor(this, 'p2') ? this.p2.y : 0; },
    get len() { return Math.hypot(this.x2 - this.x1, this.y2 - this.y1) },
    pointAt(loc) {
        const t = loc === "beg" ? 0
                : loc === "end" ? 1
                    : (loc + 0 === loc) ? loc // numerical arg ..
                        : 0.5;   // 'mid' ..
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const len = Math.hypot(dx, dy);
        return {
            x: this.x1 + dx * t,
            y: this.y1 + dy * t,
            nx: len ? dy / len : 0,
            ny: len ? -dx / len : -1
        };
    },
    hit({ x, y, eps }) {
        const {x1,y1,x2,y2} = this;
        const dx = x2 - x1, dy = y2 - y1, dx1 = x - x1, dy1 = y - y1;
        const dot = dx*dx1 + dy*dy1, perp = dx*dy1 - dy*dx1, len = Math.hypot(dx,dy), epslen = eps*len;
        return -epslen < perp && perp < epslen && -epslen < dot && dot < len*(len+eps);
    },
    drag({ dx, dy }) {
        this.x1 += dx; this.x2 += dx;
        this.y1 += dy; this.y2 += dy;
    }
}

// arc-like commands interface
g2.ifc.arc = {
    pointAt(loc) {
        const t = loc === "beg" ? 0
                : loc === "end" ? 1
                    : (loc + 0 === loc) ? loc // numerical arg [0..1] ..
                        : 0.5;   // 'mid' ..
        const ang = (this.w || 0) + t * (this.dw || Math.PI * 2);
        const cang = Math.cos(ang), sang = Math.sin(ang);
        const r = loc === "c" ? 0 : this.r;
        return {
            x: this.x + r * cang,
            y: this.y + r * sang,
            nx: cang,
            ny: sang
        };
    },
    asPoly() {
        const {x,y,r} = this;
        const N = Math.floor(this.dw*r / (4*(this.lw || 1)));
        const dw = this.dw/N;
        const pts = [];

        for (let w = this.w; w < this.dw - dw; w += dw)
            pts.push({x: x + r*Math.cos(w), y: y + r*Math.sin(w)});

        return pts;
    }
}

// circular-like commands interface
g2.ifc.circular = {
    get isSolid() { return this.fs && this.fs !== 'transparent' },
    get len() { return 2 * Math.PI * this.r; },
    get lsh() { return this.state & g2.OVER; },
    get sh() { return this.state & g2.OVER ? [0, 0, 5, "black"] : false },
    pointAt(loc, cartesian) {
        const Q = Math.SQRT2 / 2;
        const LOC = { c: [0, 0], e: [1, 0], ne: [Q, Q], n: [0, 1], nw: [-Q, Q], w: [-1, 0], sw: [-Q, -Q], s: [0, -1], se: [Q, -Q] };
        const q = (loc + 0 === loc) ? [Math.cos(loc * 2 * Math.PI), Math.sin(loc * 2 * Math.PI)]
            : (LOC[loc || "c"] || [0, 0]);

        if (!cartesian) q[1] = -q[1];

        return {
            x: this.x + q[0] * this.r,
            y: this.y + q[1] * this.r,
            nx: q[0],
            ny: q[1]
        };
    },
    asPoly() {
        const {x,y,r} = this;
        const N = Math.max(Math.floor(2*Math.PI*r / (4*(this.lw || 1))), 5);
        const dw = 2*Math.PI/N;
        const pts = [];

        for (let w = 0; w < 2*Math.PI - dw; w += dw)
            pts.push({x: x + r*Math.cos(w), y: y + r*Math.sin(w)});

        return pts;
    },
    hit({ x, y, eps }) {
        return this.isSolid ? this.isPntIn({ x, y, eps }) : this.isPntOn({ x, y, eps });
    },
    isPntIn({ x, y, eps }) {
        return (this.x - x)**2 + (this.y - y)**2 < this.r**2;
    },
    isPntOn({ x, y, eps }) {
        const ddis = (this.x - x)**2 + (this.y - y)**2 - this.r**2, reps = eps*this.r;
        return -reps < ddis && ddis < reps;
    }
}

/**
 * `label` interface.
 * add label text to element.
 * @method
 * @param {string | object} - label string or object.
 * @property {string} str - label string.
 * @property {number} off - offset to label location.
 * @property {string | number} loc - label's center location (element specific)
 * @property {string} [font='normal 14px serif'] - label font.
 * @property {boolean} [border=false] - draw elliptical label border.
 * @property {object} border - draw elliptical label border using `{ls='transparent',fs='#ffc'}` style.
 */
g2.ifc.label = {
    significantDigits: 2,
    get offset() { 
        const off = this.label.off !== undefined ? +this.label.off : (this.lboff || 1);
        return off + Math.sign(off) * (this.lw || 2) / 2;
    },
    valueFrom(str) {
        const val = this[str];
        return isNaN(str) ? val
             : Number.isInteger(val) ? Number(val)
             : Number(val).toFixed(Math.max(this.significantDigits - Math.log10(val), 0));
    },
    get string() {   // example 'len=@len; mm'
        const s = typeof this.label === 'object' ? this.label.str 
                : typeof this.label === 'string' ? this.label 
                : '?';
        return s.replace(/([^@]*)@([^;]+);?(.*)/g,($0,$1,$2,$3)=>$1+($2?this.valueFrom($2):'')+$3);
    },

    g2_level: 5,
    g2(vw) {
        const lbl = this.label;
        if (lbl) {
            const font = (lbl.font || g2.defaultStyle.font);
            const h = +font.replace(/.*?([0-9]+)px.*/g,($0,$1)=>$1);
            const str = this.string;
            const rx = (str.length || 1) * 0.65 * h / 2; 
            const ry = 1.25 * h / 2;    // ellipse semi-axes length 
            const pos = this.pointAt(lbl.loc || this.lbloc, !!vw.cartesian);
            const off = this.offset;
            const p = {
                x: pos.x + pos.nx * (off + Math.sign(off) * rx),
                y: pos.y + pos.ny * (off + Math.sign(off) * ry)
            };
            const g = g2();

            if (lbl.border || lbl.fs) {
                lbl.fs = lbl.border && lbl.border.fs || (lbl.fs === '@' ? this.fs : lbl.fs) || '#ffc';
                g.ell({ x: p.x, y: p.y, rx, ry, 
                        ls: (lbl.border === true ? this.ls : (lbl.border?.ls || lbl.ls)) || 'transparent',
                        fs: lbl.border?.fs || lbl.fs || '#ffc' });
            }
            g.txt({
                str, x: p.x, y: p.y,
                thal: "center", tval: "middle",
                fs: lbl.ls || this.ls || 'black', 
                font
            });

            return g;
        }
    }
}

// hatch interface
g2.ifc.hatch = {
    g2_level: 1,
    g2() {
        if (this.hatch && this.asPoly) {
            const g = g2();
            const deflt = {w:Math.PI/4,dist:4*(this.lw||1),gap:3*(this.lw||1),lc:'round'};
            const hatch = this.hatch === true ? deflt : {...deflt,...this.hatch};
            const {ls,lw,lc} = {...this,...hatch};
            const lines = poly2.hatch(hatch, this.asPoly());
            if (lines.length > 1) {
                let d = '';
                for (let i=0; i < lines.length; i+=2)
                    d += `M${lines[i].x},${lines[i].y}L${lines[i+1].x},${lines[i+1].y}`;
                g.stroke({d,ls,lw,lc});
            }
            return g;
        }
    }
}


/**
 * `arc` command prototype
 */
g2.prototype.arc.prototype = g2.mixin(g2.ifc.point, g2.ifc.arc, g2.ifc.label, g2.ifc.hatch, {
    get angle() { return this.dw*180/Math.PI }
})

/**
 * `box` command prototype
 */
g2.prototype.box.prototype = g2.mixin(g2.ifc.label, g2.ifc.hatch, {
    x:0, y:0, w:0,
    asPoly() {
        const b2 = this.b/2, h2 = this.h/2;
        const pts = [{x:-b2,y:-h2},{x:b2,y:-h2},{x:b2,y:h2},{x:-b2,y:h2}];
        return poly2.proxy.trf(pts,{x,y,w}=this);
    },
    pointAt(loc) {
        const {x,y,b,h} = this;
        const diag = Math.hypot(b,h), dx = b/diag, dy = h/diag;
        const LOC = { c: [0,0,0,0], e: [b/2,0,1,0], ne: [b/2,h/2,dx,dy], n: [0,h/2,0,1], nw: [-b/2,h/2,-dx,dy], 
                      w: [-b/2,0,-1,0], sw: [-b/2,-h/2,-dx,-dy], s: [0,-h/2,0,-1], se: [b/2,-h/2,dx,-dy] };
        const q = LOC[loc] || LOC['c'];
        if (this.w) {
            const cw = Math.cos(this.w), sw = Math.sin(this.w);
            return {
                x: x + cw*q[0] - sw*q[1],
                y: y + sw*q[0] + cw*q[1],
                nx: cw*q[2] - sw*q[3],
                ny: sw*q[2] + cw*q[3]
            };
        }
        return {
            x: x + q[0],
            y: y + q[1],
            nx: q[2],
            ny: q[3]
        };
    }
})

/**
 * `cir` command prototype
 */
g2.prototype.cir.prototype = g2.mixin(g2.ifc.point, g2.ifc.circular, g2.ifc.label, g2.ifc.hatch);

/**
 * `lin` command prototype
 */
g2.prototype.lin.prototype = g2.mixin(g2.ifc.line, g2.ifc.label, {
    drag({ dx, dy }) {
        this.x1 += dx; this.x2 += dx;
        this.y1 += dy; this.y2 += dy;
    }
});

/**
 * `rec` command prototype
 */
g2.prototype.rec.prototype = g2.mixin(g2.ifc.label, g2.ifc.hatch, {
    asPoly() {
        const {x,y,b,h} = this;
        return [{x,y},{x:x+b,y},{x:x+b,y:y+h},{x,y:y+h}];
    },
    pointAt(loc) {
        const {b,h} = this;
        const diag = Math.hypot(b,h), dx = b/diag, dy = h/diag;
        const LOC = { c: [b/2,h/2,0,0], e: [b,h/2,1,0], ne: [b,h,dx,dy], n: [b/2,h,0,1], nw: [0,h,-dx,dy], 
                      w: [0,h/2,-1,0], sw: [0,0,-dx,-dy], s: [b/2,0,0,-1], se: [b,0,dx,-dy] };
        const q = LOC[loc] || LOC['c'];
        return {
            x: this.x + q[0],
            y: this.y + q[1],
            nx: q[2],
            ny: q[3]
        };
    }
})

/**
* Draw interactive handle.
* @method
* @returns {object} g2
* @param {object} - handle object.
* @property {number} x - x-value center.
* @property {number} y - y-value center.
* @example
* g2().hdl({x:100,y:80})  // Draw handle.
*/
g2.prototype.hdl = function (args) { return this.addCommand({ c: 'hdl', a: args }); }
g2.prototype.hdl.prototype = g2.mixin(g2.ifc.point, g2.ifc.circular, g2.ifc.label, g2.ifc.hatch, {
    r: 5,
    isSolid: true,
    draggable: true,
    lbloc: 'se',
    get lsh() { return this.state & g2.OVER; },
    get sh() { return this.state & g2.OVER ? [0, 0, 5, "black"] : false },
    g2() {
        const { x, y, r, ls = 'black', fs = '#ffc', sh } = this;
        return g2().cir({ x, y, r, ls, fs, sh });
    }
});

/**
* Node symbol command.
* @param {object} - arguments object.
* @property {number} x - x-value center.
* @property {number} y - y-value center.
* @property {number} [r=5] - radius.
* @example
* g2().nod({x:10,y:10})
*/
g2.prototype.nod = function (args = {}) { return this.addCommand({ c: 'nod', a: args }); }
g2.prototype.nod.prototype = g2.mixin(g2.ifc.point, g2.ifc.circular, g2.ifc.label, {
    r: 5,
    lbloc: 'se',
    g2() {
        const {x,y,r,ls=g2.symbol.nodcolor,fs=g2.symbol.nodfill} = this;
        return g2().cir({x,y,r,fs,ls});
    }
})

/**
 * Double node symbol
 * @returns {object} g2
 * @param {object} - arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @property {number} [r=6] - radius.
 * @example
 * g2().dblnod({x:100,y:100})
 */
g2.prototype.dblnod = function ({ x = 0, y = 0 }) { return this.addCommand({ c: 'dblnod', a: arguments[0] }); }
g2.prototype.dblnod.prototype =  g2.mixin(g2.ifc.point, g2.ifc.circular, g2.ifc.label, {
    r: 6,
    lbloc: 'se',
    g2() {
        const {x,y,r,ls=g2.symbol.nodcolor,fs=g2.symbol.nodfill,fs_2=g2.symbol.nodfill2} = this;
        return g2().cir({x,y,r,ls,fs})
                   .cir({x,y,r:r/2,ls,fs:fs_2})
    }
})

/**
 * Ground revolute joint symbol
 * @returns {object} g2
 * @param {object} - arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @property {number} [r=6] - radius.
 * @example
 * g2().gnd({x:100,y:100})
 */
g2.prototype.gnd = function ({x,y,r}) { return this.addCommand({ c: 'gnd', a: arguments[0] }); }
g2.prototype.gnd.prototype = g2.mixin(g2.ifc.point, g2.ifc.circular, g2.ifc.label, {
    r: 6,
    lbloc: 'se',
    g2(vw) {
        const {x,y,r=4,ls=g2.symbol.nodcolor,fs=g2.symbol.nodfill} = this;
        const sgn = vw.cartesian ? 1 : -1;
        return g2()
            .cir({x,y,r,ls,fs})
            .path({seg: [
                {c:'m', x, y:y+sgn*r},
                {c:'a', x:x-r, y, dw:sgn*Math.PI/2},
                {c:'l', x:x+r, y},
                {c:'a', x, y:y-sgn*r, dw:-sgn*Math.PI/2},
                {c:'z'}
              ], ls:'transparent',fs:g2.symbol.nodcolor});
    }
})

/**
 * Pole symbol
 * @returns {object} g2
 * @param {object} - arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @property {number} [r=6] - radius.
 * @example
 * g2().gnd({x:100,y:100,r:10})
 */
g2.prototype.pol = function pol({x,y,r}) { return this.addCommand({ c: 'pol', a: arguments[0] }); }
g2.prototype.pol.prototype = g2.mixin(g2.ifc.point, g2.ifc.circular, g2.ifc.label, {
    r: 6,
    lbloc: 'se',
    g2(vw) {
        const {x,y,r,ls=g2.symbol.nodcolor,fs=g2.symbol.nodfill} = this;
        return g2().cir({x,y,r,fs,ls})
                   .cir({x,y,r:r*2/5,fs:ls,ls:'transparent'})
    }
})

/**
 * Slider symbol
 * @method
 * @returns {object} g2
 * @param {object} - slider arguments object.
 * @property {number} x - start x coordinate.
 * @property {number} y - start y coordinate.
 * @property {number} [b=32] - slider breadth.
 * @property {number} [h=16] - slider height.
 * @property {number} [w=0] - rotation.
 * @example
 * g2().slider({x:150,y:75,w:Math.PI/4,b:64,h:32})
 */
g2.prototype.slider = function ({x,y,b,h,w,ls,fs,fs_2}) { return this.addCommand({c:'slider',a:arguments[0]}); }
g2.prototype.slider.prototype = g2.mixin(g2.ifc.point, g2.ifc.circular, g2.ifc.label, {
    b:32, h:16,
    r:5,
    w:0,
    lbloc: 'se',
    lboff: 4,
    g2(vw) {
        const {x,y,b,h,r,w,ls=g2.symbol.nodcolor,fs=g2.symbol.nodfill,fs_2='#fefefe99'} = this;
        return g2().box({x,y,w,b,h,fs:fs_2})
                   .cir({x,y,r,fs,ls})
    }
})

/* Polygonial link.
 * @method
 * @returns {object} g2
 * @param {object} - arguments object.
 * @property {object[] | number[][] | number[]} pts - array of points.
 * @property {bool} [closed = false] - closed link.
 * @property {number} x - start x coordinate.
 * @property {number} y - start y coordinate.
 * @property {number} [w=0] - angle.
 * @example
 * const A = {x:50,y:25},B = {x:150,y:25},
 *       C = {x:50,y:75}, D = {x:100,y:75},
 *       E = {x:50,y:125};
 * g2().view({cartesian:true})
 *     .link({pts:[A,B,E,A,D,C]})
 */
g2.prototype.link = function ({pts,x,y,w}) { return this.addCommand({c:'link',a:arguments[0]}); }
g2.prototype.link.prototype = {
    x:0,y:0,w:0,
    closed: false,
    g2(vw) {
        const {pts,closed,x,y,w,ls='#666',fs='#fefefe66',lw=5,lc='round',lj='round'} = this;
        return g2().ply({pts,x,y,w,ls,fs:closed?fs:'transparent',lw,lc,lj});
    }
}

/**
 * YinYang symbol
 * @returns {object} g2
 * @param {object} - arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @property {number} [r=12] - radius.
 * @property {color} [ls='#666'] - strokecolor.
 * @property {color} [fs='#eee'] - fillcolor.
 * @example
 * g2().yinyang({x:100,y:100,r:10})
 */
g2.prototype.yinyang = function yinyang({x,y,r,ls,fs,lw}) { return this.addCommand({ c: 'yinyang', a: arguments[0] }); }
g2.prototype.yinyang.prototype = {
    r: 12,
    g2(vw) {
        const pi = Math.PI;
        const sgn = vw.cartesian ? -1 : 1;
        const {x,y,r,ls='#666',fs='#eee',lw=1} = this;
        return g2().beg({x,y,r,ls,fs,lw})
                        .cir({r})
                        .path({seg:[
                            {c:'m',x:0,y:-sgn*r},
                            {c:'a',x:0,y: 0, dw: sgn*pi},
                            {c:'a',x:0,y: sgn*r, dw:-sgn*pi},
                            {c:'a',x:0,y:-sgn*r, dw:-sgn*pi},
                            {c:'z'}
                            ], fs:ls})
                        .cir({y: sgn*r/2,r:r/4})
                        .cir({y:-sgn*r/2,r,r:r/4,ls:'transparent',fs:ls})
                    .end()
    }
}


/**
 * Extended style values.
 * Not really meant to get overwritten. But if you actually want, proceed.<br>
 * These styles can be referenced using the comfortable '@' syntax.
 * @namespace
 * @property {object} symbol  `g2` symbol namespace.
 * @property {object} [symbol.tick] Predefined symbol: a little tick
 * @property {object} [symbol.dot] Predefined symbol: a little dot
 * @property {object} [symbol.sqr] Predefined symbol: a little square
 * @property {string} [symbol.nodcolor=#333]    node color.
 * @property {string} [symbol.nodfill=#dedede]   node fill color.
 * @property {string} [symbol.nodfill2=#aeaeae]  alternate node fill color, somewhat darker.
 * @property {string} [symbol.linkcolor=#666]   link color.
 * @property {string} [symbol.linkfill=rgba(225,225,225,0.75)]   link fill color, semi-transparent.
 * @property {string} [symbol.dimcolor=darkslategray]   dimension color.
 * @property {array} [symbol.solid=[]]   solid line style.
 * @property {array} [symbol.dash=[15,10]]   dashed line style.
 * @property {array} [symbol.dot=[4,4]]   dotted line style.
 * @property {array} [symbol.dashdot=[25,6.5,2,6.5]]   dashdotted line style.
 * @property {number} [symbol.labelOffset=5]    default label offset distance.
 * @property {number} [symbol.labelSignificantDigits=3]   default label's significant digits after numbering point.
 */
g2.symbol = g2.symbol || {};
g2.symbol.tick = g2().path({ d:'M0,-2L0,2', lc: "round" });
g2.symbol.dot = g2().cir({ x: 0, y: 0, r: 2, ls: "transparent" });
g2.symbol.sqr = g2().rec({ x: -1.5, y: -1.5, b: 3, h: 3, ls: "transparent" });

g2.symbol.nodcolor = "#333";
g2.symbol.nodfill = "#dedede";
g2.symbol.nodfill2 = "#aeaeae";
g2.symbol.linkcolor = "#666";
g2.symbol.linkfill = "rgba(225,225,225,0.75)";
g2.symbol.dimcolor = "darkslategray";
g2.symbol.solid = [];
g2.symbol.dash = [15, 10];
g2.symbol.dot = [4, 4];
g2.symbol.dashdot = [25, 6.5, 2, 6.5];
g2.symbol.labelSignificantDigits = 3;  //  0.1234 => 0.123,  0.01234 => 0.0123, 1.234 => 1.23, 12.34 => 12.3, 123.4 => 123, 1234 => 1234

// Html canvas handler
g2.canvasHdl = function (ctx) {
    if (this instanceof g2.canvasHdl) {
        if (ctx instanceof CanvasRenderingContext2D) {
            this.ctx = ctx;
            this.cur = g2.defaultStyle;
            this.stack = [this.cur];
            this.matrix = [[1, 0, 0, 1, 0.5, 0.5]];
            this.gridBase = 2;
            this.gridExp = 1;
            return this;
        }
        else
            return null;
    }
    return g2.canvasHdl.apply(Object.create(g2.canvasHdl.prototype), arguments);
};
g2.handler.factory.push((ctx) => ctx instanceof g2.canvasHdl ? ctx
    : ctx instanceof CanvasRenderingContext2D ? g2.canvasHdl(ctx) : false);

g2.canvasHdl.prototype = {
    init(grp, style) {
        this.stack.length = 1;
        this.matrix.length = 1;
        this.initStyle(style ? Object.assign({}, this.cur, style) : this.cur);
        return true;
    },
    view({ x = 0, y = 0, scl = 1, cartesian = false }) {
        this.pushTrf(cartesian ? [scl, 0, 0, -scl, x, this.ctx.canvas.height - 1 - y]
            : [scl, 0, 0, scl, x, y]);
    },
    grid({ color = '#ccc', size } = {}) {
        const ctx = this.ctx, b = ctx.canvas.width, h = ctx.canvas.height,
            { x, y, scl } = this.uniTrf,
            sz = size || this.gridSize(scl),
            xoff = x % sz, yoff = y % sz;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = xoff, nx = b + 1; x < nx; x += sz) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = yoff, ny = h + 1; y < ny; y += sz) { ctx.moveTo(0, y); ctx.lineTo(b, y); }
        ctx.stroke();
        ctx.restore();
    },
    clr({ b, h } = {}) {
        const ctx = this.ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, b || ctx.canvas.width, h || ctx.canvas.height);
        ctx.restore();
    },
    cir({ r }) {
        const { x = 0, y = 0 } = arguments[0];
        this.ctx.beginPath();
        this.ctx.arc(x || 0, y || 0, Math.abs(r), 0, 2 * Math.PI, true);
        this.drw(arguments[0]);
    },
    arc({ r, w = 0, dw = 2 * Math.PI }) {
        const { x = 0, y = 0 } = arguments[0];
        if (Math.abs(dw) > Number.EPSILON && Math.abs(r) > Number.EPSILON) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, Math.abs(r), w, w + dw, dw < 0);
        }
        else if (Math.abs(dw) < Number.EPSILON && Math.abs(r) > Number.EPSILON) {
            const cw = Math.cos(w), sw = Math.sin(w);
            this.ctx.beginPath();
            this.ctx.moveTo(x - r * cw, y - r * sw);
            this.ctx.lineTo(x + r * cw, y + r * sw);
        }
        //  else  // nothing to draw with r === 0
        this.drw(arguments[0]);
    },
    ell({ rx, ry, w = 0, dw = 2 * Math.PI, rot = 0 }) {
        const { x = 0, y = 0 } = arguments[0];
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, w, w + dw, dw < 0);
        this.drw(arguments[0]);
    },
    box({ x=0, y=0, w=0, b, h }) {
        if (w === 0)
            this.rec({...arguments[0],x:x-b/2,y:y-h/2});
        else {
            const tmp = this.setStyle(arguments[0]);
            const [cw, sw] = [Math.cos(w), Math.sin(w)];
            this.ctx.save();
            this.ctx.transform(cw, sw, -sw, cw, x, y);
            this.ctx.fillRect(-b/2,-h/2, b, h);
            this.ctx.strokeRect(-b/2,-h/2, b, h);
            this.ctx.restore();
            this.resetStyle(tmp);
        }
    },
    rec({ b, h }) {
        const { x = 0, y = 0 } = arguments[0].p !== undefined ? arguments[0].p : arguments[0];
        const tmp = this.setStyle(arguments[0]);
        this.ctx.fillRect(x, y, b, h);
        this.ctx.strokeRect(x, y, b, h);
        this.resetStyle(tmp);
    },
    lin(args) {
        this.ctx.beginPath();
        this.ctx.moveTo(args.x1 || 0, args.y1 || 0);
        this.ctx.lineTo(args.x2 || 0, args.y2 || 0);
        this.stroke(args);
    },
    ply(args) {
        const pts = args.pts;
        const len = pts.length;
        let   p = pts[0];
        this.ctx.beginPath();
        this.ctx.moveTo(p.x,p.y);
        for (let i = 1; i < len; i++)
            this.ctx.lineTo((p = pts[i]).x, p.y);
        if (args.closed)  // closed then ..
            this.ctx.closePath();
        this.drw(args);
        return len;  // number of points ..
    },
    txt({ str, w = 0 }) {
        const { x = 0, y = 0 } = arguments[0].p !== undefined ? arguments[0].p : arguments[0];
        const tmp = this.setStyle(arguments[0]);
        const sw = w ? Math.sin(w) : 0, cw = w ? Math.cos(w) : 1;
        const trf = this.isCartesian ? [cw, sw, sw, -cw, x, y] : [cw, sw, -sw, cw, x, y];

        this.setTrf(trf);
        if (this.ctx.fillStyle === 'rgba(0, 0, 0, 0)') {
            this.ctx.fillStyle = this.ctx.strokeStyle;
            tmp.fs = 'transparent';
        }
        this.ctx.fillText(str, 0, 0);
        this.resetTrf();
        this.resetStyle(tmp);
    },
    errorImageStr: "data:image/gif;base64,R0lGODlhHgAeAKIAAAAAmWZmmZnM/////8zMzGZmZgAAAAAAACwAAAAAHgAeAEADimi63P5ryAmEqHfqPRWfRQF+nEeeqImum0oJQxUThGaQ7hSs95ezvB4Q+BvihBSAclk6fgKiAkE0kE6RNqwkUBtMa1OpVlI0lsbmFjrdWbMH5Tdcu6wbf7J8YM9H4y0YAE0+dHVKIV0Efm5VGiEpY1A0UVMSBYtPGl1eNZhnEBGEck6jZ6WfoKmgCQA7",
    images: Object.create(null),
    async loadImage(uri) {
        const download = async (xuri) => {
            const pimg = new Promise((resolve, reject) => {
                let img = new Image();
                img.src = xuri;
                function error(err) {
                    img.removeEventListener('load', load);
                    img = undefined;
                    reject(err);
                };
                function load() {
                    img.removeEventListener('error', error);
                    resolve(img);
                    img = undefined;
                };
                img.addEventListener('error', error, { once: true });
                img.addEventListener('load', load, { once: true });
            });

            try {
                return await pimg;
            } catch (err) {
                // console.warn(`failed to (pre-)load image; '${xuri}'`, err);
                if (xuri === this.errorImageStr) {
                    throw err;
                } else {
                    return await download(this.errorImageStr);
                }
            }
        }

        let img = this.images[uri];
        if (img !== undefined) {
            return img instanceof Promise ? await img : img;
        }
        img = download(uri);
        this.images[uri] = img;
        try {
            img = await img;
        } finally {
            this.images[uri] = img;
        }
        return img;
    },
    async img({ uri, x = 0, y = 0, b, h, sx = 0, sy = 0, sb, sh, xoff = 0, yoff = 0, w = 0, scl = 1 }) {
        const img_ = await this.loadImage(uri);
        this.ctx.save();
        const cart = this.isCartesian ? -1 : 1;
        sb = sb || img_.width;
        b = b || img_.width;
        sh = (sh || img_.height);
        h = (h || img_.height) * cart;
        yoff *= cart;
        w *= cart;
        y = this.isCartesian ? -(y / scl) + sy : y / scl;
        const [cw, sw] = [Math.cos(w), Math.sin(w)];
        this.ctx.scale(scl, scl * cart);
        this.ctx.transform(cw, sw, -sw, cw, x / scl, y);
        this.ctx.drawImage(img_, sx, sy, sb, sh, xoff, yoff, b, h);
        this.ctx.restore();
    },
    beg({ w = 0, scl = 1, matrix/*,unsizable*/ } = {}) {
        const { x = 0, y = 0 } = arguments[0].p !== undefined ? arguments[0].p : arguments[0];
        let trf = matrix;
        if (!trf) {
            const ssw = w ? Math.sin(w) * scl : 0;
            const scw = w ? Math.cos(w) * scl : scl;
            trf = [scw, ssw, -ssw, scw, x, y];
        }
        this.pushTrf(trf);
        this.pushStyle(arguments[0]);
    },
    end() {
        this.popStyle();
        this.popTrf();
    },
    path(args) {
        const ctx = this.ctx;
        const tmp = this.setStyle(args);
        const {w=0,x=0,y=0} = args;
        const isTrf = w || x || y;

        if (isTrf) {
            const sw = w ? Math.sin(w) : 0;
            const cw = w ? Math.cos(w) : 1;
            this.pushTrf([cw, sw, -sw, cw, x, y]);
//            console.log([cw, sw, -sw, cw, x, y])
        }
        if (args.seg) {  // segments defined ...
            const p = args.seg, n = p.length;
            let   i;  // current index
            const ifc = {
                m() { ctx.moveTo(p[i].x, p[i].y); i++; },
                l() { ctx.lineTo(p[i].x, p[i].y); i++; },
                q() { ctx.quadraticCurveTo(p[i].x,p[i].y,p[i+1].x,p[i+1].y); i+=2; },
                c() { ctx.bezierCurveTo(p[i].x,p[i].y,p[i+1].x,p[i+1].y,p[i+2].x,p[i+2].y); i+=3; },
                a() {
                    const dw = p[i].dw, dwabs = Math.abs(dw);
                    const mu = (dwabs > Number.EPSILON && dwabs < 2*Math.PI) ? 1/Math.tan(dw/2) : 0;
                    if (i > 0 && mu !== 0) {
                        const dx = p[i].x - p[i-1].x, dy = p[i].y - p[i-1].y;
                        const xc = (dx - mu*dy)/2, yc = (dy + mu*dx)/2;
                        const R = Math.hypot(xc,yc);
                        const w = Math.atan2(-yc,-xc);
                        ctx.ellipse(p[i-1].x+xc, p[i-1].y+yc, R, R, 0, w, w+dw, dw<0);
                    }
                    else
                        ctx.lineTo(p[i].x, p[i].y);
                    i++;
                },
                z() { ctx.closePath(); i++; }
            }
            ctx.beginPath();
            for (i=0; i < n; )
                ifc[p[i].c || 'l']();
            ctx.fill();
            if (ctx.shadowColor !== 'rgba(0, 0, 0, 0)' && ctx.fillStyle !== 'rgba(0, 0, 0, 0)') {
                const shc = ctx.shadowColor;              // avoid stroke shadow when filling ...
                ctx.shadowColor = 'rgba(0, 0, 0, 0)';
                ctx.stroke();
                ctx.shadowColor = shc;
            }
            else
                ctx.stroke();
        }
        else if (args.d) {
            const pth = new Path2D(args.d);   // SVG path syntax
            ctx.fill(pth);
            if (ctx.shadowColor !== 'rgba(0, 0, 0, 0)' && ctx.fillStyle !== 'rgba(0, 0, 0, 0)') {
                const shc = ctx.shadowColor;              // avoid stroke shadow when filling ...
                ctx.shadowColor = 'rgba(0, 0, 0, 0)';
                ctx.stroke(pth);
                ctx.shadowColor = shc;
            }
            else
                ctx.stroke(pth);
        }
        if (isTrf) this.popTrf();
        this.resetStyle(tmp);
    },

    stroke({ d } = {}) {
        let tmp = this.setStyle(arguments[0]);
        d ? this.ctx.stroke(new Path2D(d)) : this.ctx.stroke();  // SVG path syntax
        this.resetStyle(tmp);
    },
    fill({ d } = {}) {
        let tmp = this.setStyle(arguments[0]);
        d ? this.ctx.fill(new Path2D(d)) : this.ctx.fill();  // SVG path syntax
        this.resetStyle(tmp);
    },
    drw({ d, lsh } = {}) {
        let ctx = this.ctx,
            tmp = this.setStyle(arguments[0]),
            p = d && new Path2D(d);   // SVG path syntax
        d ? ctx.fill(p) : ctx.fill();
        if (ctx.shadowColor !== 'rgba(0, 0, 0, 0)' && ctx.fillStyle !== 'rgba(0, 0, 0, 0)' && !lsh) {
            let shc = ctx.shadowColor;        // usually avoid stroke shadow when filling ...
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
            d ? ctx.stroke(p) : ctx.stroke();
            ctx.shadowColor = shc;
        }
        else
            d ? ctx.stroke(p) : ctx.stroke();
        this.resetStyle(tmp);
    },

    // State management (transform & style)
    // getters & setters
    get: {
        fs: (ctx) => ctx.fillStyle,
        ls: (ctx) => ctx.strokeStyle,
        lw: (ctx) => ctx.lineWidth,
        lc: (ctx) => ctx.lineCap,
        lj: (ctx) => ctx.lineJoin,
        ld: (ctx) => ctx.getLineDash(),
        ldoff: (ctx) => ctx.lineDashOffset,
        ml: (ctx) => ctx.miterLimit,
        sh: (ctx) => [ctx.shadowOffsetX || 0, ctx.shadowOffsetY || 0,
        ctx.shadowBlur || 0, ctx.shadowColor || 'black'],
        font: (ctx) => ctx.font,
        thal: (ctx) => ctx.textAlign,
        tval: (ctx) => ctx.textBaseline,
    },
    set: {
        fs: (ctx, q) => { ctx.fillStyle = q; },
        ls: (ctx, q) => { ctx.strokeStyle = q; },
        lw: (ctx, q) => { ctx.lineWidth = q; },
        lc: (ctx, q) => { ctx.lineCap = q; },
        lj: (ctx, q) => { ctx.lineJoin = q; },
        ld: (ctx, q) => { ctx.setLineDash(q); },
        ldoff: (ctx, q) => { ctx.lineDashOffset = q; },
        ml: (ctx, q) => { ctx.miterLimit = q; },
        sh: (ctx, q) => {
            if (q) {
                ctx.shadowOffsetX = q[0] || 0;
                ctx.shadowOffsetY = q[1] || 0;
                ctx.shadowBlur = q[2] || 0;
                ctx.shadowColor = q[3] || 'black';
            }
        },
        font: (ctx, q) => { ctx.font = q; },
        thal: (ctx, q) => { ctx.textAlign = q; },
        tval: (ctx, q) => { ctx.textBaseline = q; }
    },
    initStyle(style) {
        for (const key in style)
            if (this.get[key] && this.get[key](this.ctx) !== style[key])
                this.set[key](this.ctx, style[key]);
    },
    setStyle(style) {  // short circuit style setting
        let q, prv = {};
        for (const key in style) {
            if (this.get[key]) {  // style keys only ...
                let keyval = style[key];
                if (typeof style[key] === 'string' && style[key][0] === '@') {
                    // also check inherited styles ...
                    const ref = style[key].substr(1);
                    keyval = g2.symbol[ref] || ref in this.get && this.get[ref](this.ctx)
                                            || ref in this.cur && this.cur[ref];
                }
                if ((q = this.get[key](this.ctx)) !== keyval) {
                    prv[key] = q;
                    this.set[key](this.ctx, keyval);
                }
            }
        }
        return prv;
    },
    resetStyle(style) {   // short circuit style reset
        for (const key in style)
            this.set[key](this.ctx, style[key]);
    },
    pushStyle(style) {
        let cur = {};  // hold changed properties ...
        for (const key in style)  // allow extended style syntax ('fs-2', ...)
            if (g2.styleRex.test(key)) {  // (extended) style keys only ...
                if (typeof style[key] === 'string' && style[key][0] === '@') {
                    let ref = style[key].substr(1);
                    style[key] = g2.symbol[ref] || this.get[ref] && this.get[ref](this.ctx);
                }
                if (this.cur[key] !== style[key]) {
                    if (key in this.set)
                        this.set[key](this.ctx, style[key]);
                    cur[key] = style[key];
                }
            }
        this.stack.push(this.cur = Object.assign({}, this.cur, cur));
    },
    popStyle() {
        let cur = this.stack.pop();
        this.cur = this.stack[this.stack.length - 1];
        for (const key in this.cur)
            if (this.get[key] && this.cur[key] !== cur[key])
                this.set[key](this.ctx, this.cur[key]);
    },
    concatTrf(q, t) {
        return [
            q[0] * t[0] + q[2] * t[1],
            q[1] * t[0] + q[3] * t[1],
            q[0] * t[2] + q[2] * t[3],
            q[1] * t[2] + q[3] * t[3],
            q[0] * t[4] + q[2] * t[5] + q[4],
            q[1] * t[4] + q[3] * t[5] + q[5]
        ];
    },
    initTrf() {
        this.ctx.setTransform(...this.matrix[0]);
    },
    setTrf(t) {
        this.ctx.setTransform(...this.concatTrf(this.matrix[this.matrix.length - 1], t));
    },
    resetTrf() {
        this.ctx.setTransform(...this.matrix[this.matrix.length - 1]);
    },
    pushTrf(t) {
        let q_t = this.concatTrf(this.matrix[this.matrix.length - 1], t);
        this.matrix.push(q_t);
        this.ctx.setTransform(...q_t);
    },
    popTrf() {
        this.matrix.pop();
        this.ctx.setTransform(...this.matrix[this.matrix.length - 1]);
    },
    get isCartesian() {  // det of mat2x2 < 0 !
        let m = this.matrix[this.matrix.length - 1];
        return m[0] * m[3] - m[1] * m[2] < 0;
    },
    get uniTrf() {
        let m = this.matrix[this.matrix.length - 1];
        return { x: m[4], y: m[5], scl: Math.hypot(m[0], m[1]), cartesian: m[0] * m[3] - m[1] * m[2] < 0 };
    },
    unscaleTrf({ x, y }) {  // remove scaling effect (make unzoomable with respect to (x,y))
        let m = this.matrix[this.matrix.length - 1],
            invscl = 1 / Math.hypot(m[0], m[1]);
        return [invscl, 0, 0, invscl, (1 - invscl) * x, (1 - invscl) * y];
    },
    gridSize(scl) {
        let base = this.gridBase, exp = this.gridExp, sz;
        while ((sz = scl * base * Math.pow(10, exp)) < 14 || sz > 35) {
            if (sz < 14) {
                if (base == 1) base = 2;
                else if (base == 2) base = 5;
                else if (base == 5) { base = 1; exp++; }
            }
            else {
                if (base == 1) { base = 5; exp--; }
                else if (base == 2) base = 1;
                else if (base == 5) base = 2;
            }
        }
        this.gridBase = base;
        this.gridExp = exp;
        return sz;
    },
    // ==========================
    // Obsolete ...
    // ==========================
    p() { this.ctx.beginPath(); },
    z() { this.ctx.closePath(); },
    m({ x, y }) { this.ctx.moveTo(x, y); },
    l({ x, y }) { this.ctx.lineTo(x, y); },
    q({ x, y, x1, y1 }) { this.ctx.quadraticCurveTo(x1, y1, x, y); },
    c({ x, y, x1, y1, x2, y2 }) { this.ctx.bezierCurveTo(x1, y1, x2, y2, x, y); },
    a({ dw, k, phi, _xp, _yp }) {  // todo: fix elliptical arc bug ...
        const { x = 0, y = 0 } = arguments[0].p !== undefined ? arguments[0].p : arguments[0];
        if (k === undefined) k = 1;  // ratio r1/r2
        if (Math.abs(dw) > Number.EPSILON) {
            if (k === 1) { // circular arc ...
                let x12 = x - _xp, y12 = y - _yp;
                let tdw_2 = Math.tan(dw / 2),
                    rx = (x12 - y12 / tdw_2) / 2, ry = (y12 + x12 / tdw_2) / 2,
                    R = Math.hypot(rx, ry),
                    w = Math.atan2(-ry, -rx);
                this.ctx.ellipse(_xp + rx, _yp + ry, R, R, 0, w, w + dw, this.cartesian ? dw > 0 : dw < 0);
            }
            else { // elliptical arc .. still buggy .. !
                if (phi === undefined) phi = 0;
                let x1 = dw > 0 ? _xp : x,
                    y1 = dw > 0 ? _yp : y,
                    x2 = dw > 0 ? x : _xp,
                    y2 = dw > 0 ? y : _yp;
                let x12 = x2 - x1, y12 = y2 - y1,
                    _dw = (dw < 0) ? dw : -dw;
                //  if (dw < 0) dw = -dw;   // test for bugs .. !
                let cp = phi ? Math.cos(phi) : 1, sp = phi ? Math.sin(phi) : 0,
                    dx = -x12 * cp - y12 * sp, dy = -x12 * sp - y12 * cp,
                    sdw_2 = Math.sin(_dw / 2),
                    R = Math.sqrt((dx * dx + dy * dy / (k * k)) / (4 * sdw_2 * sdw_2)),
                    w = Math.atan2(k * dx, dy) - _dw / 2,
                    x0 = x1 - R * Math.cos(w),
                    y0 = y1 - R * k * Math.sin(w);
                this.ctx.ellipse(x0, y0, R, R * k, phi, w, w + dw, this.cartesian ? dw > 0 : dw < 0);
            }
        }
        else
            this.ctx.lineTo(x, y);
    }
}

/**
 * g2.selectorHdl.js (c) 2018-22 Stefan Goessner
 * @file selector for `g2` elements.
 * @author Stefan Goessner
 * @license MIT License
 */
/* jshint -W014 */

/**
 * Element selector extension.
 * (Requires cartesian coordinate system)
 * @namespace
 */
var g2 = g2 || { prototype:{} };  // for jsdoc only ...

// extend prototypes for argument objects
g2.selectorHdl = function(evt) {             
    if (this instanceof g2.selectorHdl) {
        this.selection = false;
        this.evt = evt;                 // sharing evt object with canvasInteractor as owner ... important !
        return this;
    }
    return g2.selectorHdl.apply(Object.create(g2.selectorHdl.prototype), arguments);
};
g2.handler.factory.push((ctx) => ctx instanceof g2.selectorHdl ? ctx : false);

// g2.selector.state = ['NONE','OVER','DRAG','OVER+DRAG','EDIT','OVER+EDIT'];

g2.selectorHdl.prototype = {
    init(grp) { return true; },
    exe(commands) {
        for (let elm=false, i=commands.length; i && !elm; i--)  // stop after first hit .. starting from list end !
            elm = this.hit(commands[i-1].a)
    },
    selectable(elm) {
        return elm && elm.draggable && elm.hit;
    },
    hit(elm) {
        if (!this.evt.inside                                   // pointer not inside of canvas ..
         || !this.selectable(elm) )                            // no selectable elm ..
            return false;

        if (!elm.state && this.elementHit(elm) && elm.draggable) {  // no mode
            if (!this.selection || this.selection && !(this.selection.state & g2.DRAG)) {
                if (this.selection) this.selection.state ^= g2.OVER;
                this.selection = elm;
                elm.state = g2.OVER;                           // enter OVER mode ..
                this.evt.hit = true;
            }
        }
        else if (elm.state & g2.DRAG) {                        // in DRAG mode
            if (!this.evt.btn)                                 // leave DRAG mode ..
                this.elementDragEnd(elm);
        }
        else if (elm.state & g2.OVER) {                        // in OVER mode
            if (!this.elementHit(elm)) {                       // leave OVER mode ..
                elm.state ^= g2.OVER;
                this.evt.hit = false;
                this.selection = false;
            }
            else if (this.evt.btn)                             // enter DRAG mode
                this.elementDragBeg(elm);
        }

        return elm.state && elm;                               // we definitely have a valid elm here ... 
    },                                                         // ... but we only return it depending on its state. 
    elementDragBeg(elm) {
        elm.state |= g2.DRAG;
        if (elm.dragBeg) elm.dragBeg(e);
    },
    elementDragEnd(elm) {
        elm.state ^= (g2.OVER | g2.DRAG);
        this.selection = false;
        if (elm.dragEnd) elm.dragEnd(e);
    },
    elementHit(elm) {
        return elm.hit && elm.hit({x:this.evt.xusr,y:this.evt.yusr,eps:this.evt.eps});
    }
};

/**
 * canvasInteractor.js (c) 2018-22 Stefan Goessner
 * @file interaction manager for html `canvas`.
 * @author Stefan Goessner
 * @license MIT License
 */
/* jshint -W014 */
// Managing multiple canvases per static interactor as singleton ... 
// .. using a single requestAnimationFrame loop !
globalThis.canvasInteractor = globalThis.canvasInteractor || {
    create() {
        const o = Object.create(this.prototype);
        o.constructor.apply(o,arguments); 
        return o; 
    },
    // global static tickTimer properties
    fps: '?',
    fpsOrigin: 0,
    frames: 0,
    rafid: 0,
    instances: [],
    // global static timer methods
    tick(time) {
        canvasInteractor.fpsCount(time);
        for (const instance of canvasInteractor.instances) {
            instance.notify('tick',{t:time,dt:(time-instance.t)/1000,dirty:instance.dirty});  // notify listeners .. 
            instance.t = time;
            instance.dirty = false;
        }
        canvasInteractor.rafid = requestAnimationFrame(canvasInteractor.tick);   // request next animation frame ...
    },
    add(instance) {
        canvasInteractor.instances.push(instance);
        if (canvasInteractor.instances.length === 1)  // first instance added ...
            canvasInteractor.tick(canvasInteractor.fpsOrigin = performance.now());
    },
    remove(instance) {
        canvasInteractor.instances.splice(canvasInteractor.instances.indexOf(instance),1);
        if (canvasInteractor.instances.length === 0)   // last instance removed ...
            cancelAnimationFrame(canvasInteractor.rafid);
    },
    fpsCount(time) {
        if (time - canvasInteractor.fpsOrigin > 1000) {  // one second interval reached ...
            const fps = ~~(canvasInteractor.frames*1000/(time - canvasInteractor.fpsOrigin) + 0.5); // ~~ as Math.floor()
            if (fps !== canvasInteractor.fps)            // notify instances on fps change only ... !
                for (const instance of canvasInteractor.instances)
                    instance.notify('fps',canvasInteractor.fps=fps);
            canvasInteractor.fpsOrigin = time;
            canvasInteractor.frames = 0;
        }
        canvasInteractor.frames++;
    },

    prototype: {
        constructor(ctx, {x=0,y=0,scl=1,cartesian=false}) {
            // canvas interaction properties
            this.ctx = ctx;
            this.view = {x,y,scl,cartesian};
            this.evt = {
                type: false,
                x: -2, y:-2,
                xi: 0, yi:0,
                dx: 0, dy: 0,
                btn: 0,
                xbtn: 0, ybtn: 0,
                xusr: -2, yusr: -2,
                dxusr: 0, dyusr: 0,
                delta: 0,
                inside: false,
                hit: false,  // something hit by pointer ...
                dscl: 1,     // for zooming ...
                eps: 5       // some pixel tolerance ...
            };
            this.dirty = true;
            // event handler registration
            const canvas = ctx.canvas;
            canvas.addEventListener("pointermove", this, false);
            canvas.addEventListener("pointerdown", this, false);
            canvas.addEventListener("pointerup", this, false);
            canvas.addEventListener("pointerenter", this, false);
            canvas.addEventListener("pointerleave", this, false);
            canvas.addEventListener("wheel", this, false);
            canvas.addEventListener("pointercancel", this, false);

            this.signals = {}; // notification management ...
        },
        deinit() {
            const canvas = this.ctx.canvas;

            canvas.removeEventListener("pointermove", this, false);
            canvas.removeEventListener("pointerdown", this, false);
            canvas.removeEventListener("pointerup", this, false);
            canvas.removeEventListener("pointerenter", this, false);
            canvas.removeEventListener("pointerleave", this, false);
            canvas.removeEventListener("wheel", this, false);
            canvas.removeEventListener("pointercancel", this, false);

            this.endTimer();

            delete this.signals;
            delete this.evt;
            delete this.ctx;

            return this;
        },
        // canvas interaction interface
        handleEvent(e) {
            if (e.type in this && (e.isPrimary || e.type === 'wheel')) {  // can I handle events of type e.type .. ?
                const bbox = e.target.getBoundingClientRect && e.target.getBoundingClientRect() || {left:0, top:0},
                      x = e.clientX - Math.floor(bbox.left),
                      y = e.clientY - Math.floor(bbox.top),
                      btn = e.buttons !== undefined ? e.buttons : e.button || e.which;

                this.evt.type = e.type;
                this.evt.xi = this.evt.x;    // interim coordinates ...
                this.evt.yi = this.evt.y;    // ... of previous event (internal use).
                this.evt.dx = this.evt.dy = 0;
                this.evt.x = x;
                this.evt.y = this.view.cartesian ? this.ctx.canvas.height - y : y;
                this.evt.xusr = (this.evt.x - this.view.x)/this.view.scl;
                this.evt.yusr = (this.evt.y - this.view.y)/this.view.scl;
                this.evt.dxusr = this.evt.dyusr = 0;
                this.evt.dbtn = btn - this.evt.btn;
                this.evt.btn = btn;
                this.evt.delta = Math.max(-1,Math.min(1,e.deltaY||e.wheelDelta)) || 0;

                if (this.isDefaultPreventer(e.type))
                    e.preventDefault();
                this[e.type]();  // handle specific event .. !
                this.notify(this.evt.type,this.evt);  // .. tell the world .. !
            }
            else
                console.log(e)
        },
        pointermove() {
            this.evt.dx = this.evt.x - this.evt.xi;
            this.evt.dy = this.evt.y - this.evt.yi;
            if (this.evt.btn === 1) {    // pointerdown state ...
                this.evt.dxusr = this.evt.dx/this.view.scl;  // correct usr coordinates ...
                this.evt.dyusr = this.evt.dy/this.view.scl;
                this.evt.xusr -= this.evt.dxusr;  // correct usr coordinates ...
                this.evt.yusr -= this.evt.dyusr;
                if (!this.evt.hit) {      // let outer app perform panning ...
                    this.evt.type = 'pan';
                }
                else
                    this.evt.type = 'drag';
            }
            // view, geometry or graphics might be modified ...
            this.dirty = true;
        },
        pointerdown() { 
            this.evt.xbtn = this.evt.x;
            this.evt.ybtn = this.evt.y;
        },
        pointerup() { 
            this.evt.type = this.evt.x===this.evt.xbtn && this.evt.y===this.evt.ybtn ? 'click' : 'pointerup';
            this.evt.xbtn = this.evt.x;
            this.evt.ybtn = this.evt.y;
            this.evt.hit = false;        // bug removed ... ?
        },
        pointerleave() { 
            this.evt.inside = false;
        },
        pointerenter() { 
            this.evt.inside = true;
        },
        wheel() {
            this.evt.dscl = this.evt.delta>0?8/10:10/8;
            this.evt.eps /= this.evt.dscl;
            this.dirty = true;
        },
        isDefaultPreventer(type) {
            return ['pointermove','pointerdown','pointerup','wheel'].includes(type);
        },
        pntToUsr: function(p) { 
            let vw = this.view; 
            p.x = (p.x - vw.x)/vw.scl; 
            p.y = (p.y - vw.y)/vw.scl; 
            return p; 
        },
        // tickTimer interface
        startTimer() {  // shouldn't there be a global startTimer method ?
            canvasInteractor.add(this);
            this.notify('timerstart',this);                    // notify potential listeners .. 
            return this;
        },
        endTimer() {
            this.notify('timerend',this.t/1000);              // notify potential listeners .. 
            canvasInteractor.remove(this);      
            return this;
        },
        // observable interface
        notify(key,val) {
            if (this.signals[key])
                for (let hdl of this.signals[key]) 
                    hdl(val);
            return this;
        },
        on(key,handler) {   // support array of keys as first argument.
            if (Array.isArray(key))
                for (let k of key) 
                    this.on(k,handler);
            else
                (this.signals[key] || (this.signals[key]=[])).push(handler);
            
            return this;
        },
        remove(key,handler) {
            const idx = this.signals[key] ? this.signals[key].indexOf(handler) : -1;
            if (idx >= 0)
                this.signals[key].splice(idx,1);
        }
    }
};


"use strict"
//console.log('g2ExtraSymbols.js loaded');
/**
 * @author Pascal Schnabel
 * @license MIT License
 * @requires g2.core.js
 * @requires g2.ext.js
 */
/**
 * Extended G2 SymbolStyle values.
 * @namespace
 * @property {object} symbol  `g2` symbol namespace.
 * @property {object} [symbol.poldot] Predefined symbol: a little tick
 * @property {string} [symbol.nodfill3=white]    node color.
 * @property {object} [symbol.poldot] Pole Symbol
 * @property {object} [symbol.Xcross] X-Symbol
 * @property {object} [symbol.gndlines] ground line symbol
 */
g2.symbol = g2.symbol || {};
g2.symbol.poldot = g2().cir({ x: 0, y: 0, r: 1.32, ls: "transparent", fs: "black" });
g2.symbol.nodfill3 = "white";
g2.symbol.pol = g2().cir({ x: 0, y: 0, r: 6, ls: "black", lw: 1.5, fs: "white" }).use({ grp: 'poldot' });
g2.symbol.Xcross = g2().lin({ x1: 5, y1: 5, x2: -5, y2: -5 }).lin({ x1: 5, y1: -5, x2: -5, y2: 5 });
g2.symbol.gndlines = g2().lin({ x1: -10, y1: -5, x2: -5, y2: 0 })
    .lin({ x1: -5, y1: -5, x2: -0, y2: 0 })
    .lin({ x1: -0, y1: -5, x2: 5, y2: 0 })
    .lin({ x1: 5, y1: -5, x2: 10, y2: 0 });


/**
 * @property {object} [symbol.nodfix2] Predefined symbol: FG
 */
g2.symbol.nodfix2 = function () {
    const w = 9,
        h = 12;
    const FG = g2().p().m({ x: 3, y: 2 })
        .l({ x: -3, y: 2 })
        .l({ x: -w, y: -h })
        .l({ x: w, y: -h })
        .l({ x: 3, y: 2 })
        .z()
        .stroke({ ls: 'black', lw: 1.1, fs: 'white' });

    /*FG.lin({x1: 3, y1:2,x2:w,y2:-h})
    .lin({x1: -3, y1:2,x2:-w,y2:-h})
    .lin({x1: -w-5, y1:-h,x2:w+5,y2:-h});*/
    const StepSize = w * 2 / 3;
    for (let i = -w + 2; i < w + 5; i += StepSize) {
        let l = 6;
        FG.lin({ x1: i, y1: -h, x2: i - l, y2: -h - l });
    }
    FG.lin({ x1: -w - 3, y1: -h, x2: w + 3, y2: -h })
    FG.use({ grp: 'pol' });
    FG.end();
    return FG;
}

/**
 * @property {object} [symbol.slider] Predefined symbol: slider
 */
g2.symbol.slider = function () {
    const sl = g2();
    const args = { b: 32, h: 16, fs: 'white', lw: 0.8, label: { str: 'default', loc: 'ne', off: '15' } };
    return g2()
        .rec({ x: -args.b / 2, y: -args.h / 2, b: args.b, h: args.h, fs: 'white' })
        .use({ grp: "pol" })
        .end();
}


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
g2.prototype.gndline.prototype = g2.mixin(g2.ifc.line, {
    x1: 0, y1: 0, x2: 100, y2: 100, ls: "black",
    g2(vw) {
        const { x1, y1, x2, y2, lw = 2, ls = g2.symbol.nodcolor, typ = 'out', anz = 4, ds = [5, 12] } = this;
        const vec = { x: x2 - x1, y: y2 - y1 };
        const angle = Math.atan2(vec.y, vec.x);//Winkel des Vektors
        const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

        const drw = g2();
        let min, P1, P2;
        switch (typ) {
            case 'mid':
                min = (len - 8 * (anz + 1) / 2 - len / 2) / len;
                P1 = { x: x1 + Math.cos(angle) * len * min, y: y1 + Math.sin(angle) * len * min };
                drw.gndlines({ x: P1.x, y: P1.y, w: angle, ls: ls, lw, anz: anz });
                break;
            case 'out':
                min = (len - 8 * (anz + 1) / 2 - len / 2) / len;
                P1 = { x: x1 + Math.cos(angle) * ds[0] * (anz - 2), y: y1 + Math.sin(angle) * ds[0] * (anz - 2) };
                P2 = { x: x2 - Math.cos(angle) * ds[0] * anz, y: y2 - Math.sin(angle) * ds[0] * anz };
                drw.gndlines({ x: P1.x, y: P1.y, w: angle, ls: ls, lw, anz: anz, ds });
                drw.gndlines({ x: P2.x, y: P2.y, w: angle, ls: ls, lw, anz: anz, ds });
                break;
            case 'full':
                const space = ds[0]; //distance between lines
                const l = ds[1]; //length of lines
                const w2 = angle - Math.PI / 4 * 3; //Winkel der Linien
                let iEnd = len / (space) - 2;
                for (let i = 0; i < iEnd; i += 1) {
                    let x1f = x1 + (i * space + space) * Math.cos(angle);
                    let y1f = y1 + (i * space + space) * Math.sin(angle);
                    let x2f = x1f + l * Math.cos(w2);
                    let y2f = y1f + l * Math.sin(w2);
                    drw.lin({ x1: x1f, y1: y1f, x2: x2f, y2: y2f, ls: ls, lw: lw });
                }
                break;
            default:
                min = 4 * 3 / len;
                P1 = { x: x1 + Math.cos(angle) * len * min, y: y1 + Math.sin(angle) * len * min };
                const start2 = (len - 6 * 5) / len;
                P2 = { x: x1 + Math.cos(angle) * len * start2, y: y1 + Math.sin(angle) * len * start2 }
                drw.gndlines({ x: P1.x, y: P1.y, w: angle, ls: ls, lw: lw });
                drw.gndlines({ x: P2.x, y: P2.y, w: angle, ls: ls, lw: lw });
                break;
        }
        return drw.lin({ x1, y1, x2, y2, lw: lw * 2, label: this.label === undefined ? "" : this.label });
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
 * @property {number} [r] - radius of corner or size
 */
g2.prototype.corner = function ({ p1, p2, p, w, ls, r }) { return this.addCommand({ c: 'corner', a: arguments[0] }); }
g2.prototype.corner.prototype = {
    lbloc: "e", lboff: 2,
    g2(vw) {
        const { p1, p2, p, lw = 1, ls = g2.symbol.nodcolor, anz = 4, size = 20, fs = "black", side = 1, r = 20 } = this;
        const w1 = this.wref1 === undefined ? Math.atan2(-p1.x + p.x, -p1.y + p.y) : this.wref1.w;
        const w2 = this.wref2 === undefined ? Math.atan2(-p2.x + p.x, -p2.y + p.y) : this.wref2.w;
        let dw = (w2 - w1 + Math.PI * 2) % (Math.PI);
        if (this.side < 1) { dw = -dw; }
        console.log(`dw:${dw * 180 / Math.PI}`);

        const P1 = { x: p.x + -Math.cos(w1) * r, y: -Math.sin(w1) * r + p.y };
        const P2 = { x: p.x + Math.cos(w2) * r, y: Math.sin(w2) * r + p.y };
        const drw = g2();
        drw.p().m({ x: p.x, y: p.y })
            .l({ x: P1.x, y: P1.y })
            .a({ dw: (w2 - w1) * side, x: P2.x, y: P2.y })
            .l({ x: p.x, y: p.y })
            .z()
            .stroke();
        drw.cir({ x: P1.x, y: P1.y, r: 5, ls: "red" });
        drw.cir({ x: P2.x, y: P2.y, r: 5, ls: "green" });
        /* drw.beg({ x: () => p.x, y: () => p.y, w: w1 });
         drw.p().m({ x: this.size, y: 0 })
             .l({ x: Math.cos(dw) * size, y: Math.sin(dw) * size })
             .l({ x: 0, y: 0 })
             .l({ x: size, y: 0 })
             .z()
             .fill({ fs: fs, ls: ls, lw: 2, lc: 'round', lj: 'round' });
         drw.end();*/

        return drw;


    }
}
