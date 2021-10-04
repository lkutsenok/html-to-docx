import JSZip from "jszip";
import {fragment, create} from "xmlbuilder2";
import *as HTMLToVDOM_ from "html-to-vdom";
import escape from "escape-html";
import {VText} from "virtual-dom";
import colorNames from "color-name";

var isVnode = function (x) {
    return x && "VirtualNode" === x.type && "2" === x.version
};
var isWidget_1 = function (w) {
    return w && "Widget" === w.type
};
var isThunk_1 = function (t) {
    return t && "Thunk" === t.type
};
var isVhook = function (hook) {
    return hook && ("function" == typeof hook.hook && !hook.hasOwnProperty("hook") || "function" == typeof hook.unhook && !hook.hasOwnProperty("unhook"))
};
var vnode = VirtualNode, noProperties = {}, noChildren = [];

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName, this.properties = properties || noProperties, this.children = children || noChildren, this.key = null != key ? String(key) : void 0, this.namespace = "string" == typeof namespace ? namespace : null;
    var hooks, count = children && children.length || 0, descendants = 0, hasWidgets = !1, hasThunks = !1,
        descendantHooks = !1;
    for (var propName in properties) if (properties.hasOwnProperty(propName)) {
        var property = properties[propName];
        isVhook(property) && property.unhook && (hooks || (hooks = {}), hooks[propName] = property)
    }
    for (var i = 0; i < count; i++) {
        var child = children[i];
        isVnode(child) ? (descendants += child.count || 0, !hasWidgets && child.hasWidgets && (hasWidgets = !0), !hasThunks && child.hasThunks && (hasThunks = !0), descendantHooks || !child.hooks && !child.descendantHooks || (descendantHooks = !0)) : !hasWidgets && isWidget_1(child) ? "function" == typeof child.destroy && (hasWidgets = !0) : !hasThunks && isThunk_1(child) && (hasThunks = !0)
    }
    this.count = count + descendants, this.hasWidgets = hasWidgets, this.hasThunks = hasThunks, this.hooks = hooks, this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = "2", VirtualNode.prototype.type = "VirtualNode";
var vtext = VirtualText;

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = "2", VirtualText.prototype.type = "VirtualText";
var isVtext = function (x) {
    return x && "VirtualText" === x.type && "2" === x.version
};
var commonjsGlobal = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

function unwrapExports(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x.default : x
}

function createCommonjsModule(fn, basedir, module) {
    return fn(module = {
        path: basedir, exports: {}, require: function (path, base) {
            return function () {
                throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")
            }(null == base && module.path)
        }
    }, module.exports), module.exports
}

var fs = {};

function normalizeArray(parts, allowAboveRoot) {
    for (var up = 0, i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        "." === last ? parts.splice(i, 1) : ".." === last ? (parts.splice(i, 1), up++) : up && (parts.splice(i, 1), up--)
    }
    if (allowAboveRoot) for (; up--; up) parts.unshift("..");
    return parts
}

var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/, splitPath = function (filename) {
    return splitPathRe.exec(filename).slice(1)
};

function resolve() {
    for (var resolvedPath = "", resolvedAbsolute = !1, i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? arguments[i] : "/";
        if ("string" != typeof path) throw new TypeError("Arguments to path.resolve must be strings");
        path && (resolvedPath = path + "/" + resolvedPath, resolvedAbsolute = "/" === path.charAt(0))
    }
    return (resolvedAbsolute ? "/" : "") + (resolvedPath = normalizeArray(filter(resolvedPath.split("/"), (function (p) {
        return !!p
    })), !resolvedAbsolute).join("/")) || "."
}

function normalize(path) {
    var isPathAbsolute = isAbsolute(path), trailingSlash = "/" === substr(path, -1);
    return (path = normalizeArray(filter(path.split("/"), (function (p) {
        return !!p
    })), !isPathAbsolute).join("/")) || isPathAbsolute || (path = "."), path && trailingSlash && (path += "/"), (isPathAbsolute ? "/" : "") + path
}

function isAbsolute(path) {
    return "/" === path.charAt(0)
}

var path = {
    extname: function (path) {
        return splitPath(path)[3]
    }, basename: function (path, ext) {
        var f = splitPath(path)[2];
        return ext && f.substr(-1 * ext.length) === ext && (f = f.substr(0, f.length - ext.length)), f
    }, dirname: function (path) {
        var result = splitPath(path), root = result[0], dir = result[1];
        return root || dir ? (dir && (dir = dir.substr(0, dir.length - 1)), root + dir) : "."
    }, sep: "/", delimiter: ":", relative: function (from, to) {
        function trim(arr) {
            for (var start = 0; start < arr.length && "" === arr[start]; start++) ;
            for (var end = arr.length - 1; end >= 0 && "" === arr[end]; end--) ;
            return start > end ? [] : arr.slice(start, end - start + 1)
        }

        from = resolve(from).substr(1), to = resolve(to).substr(1);
        for (var fromParts = trim(from.split("/")), toParts = trim(to.split("/")), length = Math.min(fromParts.length, toParts.length), samePartsLength = length, i = 0; i < length; i++) if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break
        }
        var outputParts = [];
        for (i = samePartsLength; i < fromParts.length; i++) outputParts.push("..");
        return (outputParts = outputParts.concat(toParts.slice(samePartsLength))).join("/")
    }, join: function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return normalize(filter(paths, (function (p, index) {
            if ("string" != typeof p) throw new TypeError("Arguments to path.join must be strings");
            return p
        })).join("/"))
    }, isAbsolute: isAbsolute, normalize: normalize, resolve: resolve
};

function filter(xs, f) {
    if (xs.filter) return xs.filter(f);
    for (var res = [], i = 0; i < xs.length; i++) f(xs[i], i, xs) && res.push(xs[i]);
    return res
}

var substr = "b" === "ab".substr(-1) ? function (str, start, len) {
    return str.substr(start, len)
} : function (str, start, len) {
    return start < 0 && (start = str.length + start), str.substr(start, len)
}, inherits_browser = createCommonjsModule((function (module) {
    "function" == typeof Object.create ? module.exports = function (ctor, superCtor) {
        superCtor && (ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }))
    } : module.exports = function (ctor, superCtor) {
        if (superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function () {
            };
            TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor
        }
    }
}));

function EventHandlers() {
}

function EventEmitter() {
    EventEmitter.init.call(this)
}

function $getMaxListeners(that) {
    return void 0 === that._maxListeners ? EventEmitter.defaultMaxListeners : that._maxListeners
}

function emitNone(handler, isFn, self) {
    if (isFn) handler.call(self); else for (var len = handler.length, listeners = arrayClone(handler, len), i = 0; i < len; ++i) listeners[i].call(self)
}

function emitOne(handler, isFn, self, arg1) {
    if (isFn) handler.call(self, arg1); else for (var len = handler.length, listeners = arrayClone(handler, len), i = 0; i < len; ++i) listeners[i].call(self, arg1)
}

function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn) handler.call(self, arg1, arg2); else for (var len = handler.length, listeners = arrayClone(handler, len), i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2)
}

function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn) handler.call(self, arg1, arg2, arg3); else for (var len = handler.length, listeners = arrayClone(handler, len), i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2, arg3)
}

function emitMany(handler, isFn, self, args) {
    if (isFn) handler.apply(self, args); else for (var len = handler.length, listeners = arrayClone(handler, len), i = 0; i < len; ++i) listeners[i].apply(self, args)
}

function _addListener(target, type, listener, prepend) {
    var m, events, existing, e;
    if ("function" != typeof listener) throw new TypeError('"listener" argument must be a function');
    if ((events = target._events) ? (events.newListener && (target.emit("newListener", type, listener.listener ? listener.listener : listener), events = target._events), existing = events[type]) : (events = target._events = new EventHandlers, target._eventsCount = 0), existing) {
        if ("function" == typeof existing ? existing = events[type] = prepend ? [listener, existing] : [existing, listener] : prepend ? existing.unshift(listener) : existing.push(listener), !existing.warned && (m = $getMaxListeners(target)) && m > 0 && existing.length > m) {
            existing.warned = !0;
            var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + type + " listeners added. Use emitter.setMaxListeners() to increase limit");
            w.name = "MaxListenersExceededWarning", w.emitter = target, w.type = type, w.count = existing.length, e = w, "function" == typeof console.warn ? console.warn(e) : console.log(e)
        }
    } else existing = events[type] = listener, ++target._eventsCount;
    return target
}

function _onceWrap(target, type, listener) {
    var fired = !1;

    function g() {
        target.removeListener(type, g), fired || (fired = !0, listener.apply(target, arguments))
    }

    return g.listener = listener, g
}

function listenerCount(type) {
    var events = this._events;
    if (events) {
        var evlistener = events[type];
        if ("function" == typeof evlistener) return 1;
        if (evlistener) return evlistener.length
    }
    return 0
}

function arrayClone(arr, i) {
    for (var copy = new Array(i); i--;) copy[i] = arr[i];
    return copy
}

EventHandlers.prototype = Object.create(null), EventEmitter.EventEmitter = EventEmitter, EventEmitter.usingDomains = !1, EventEmitter.prototype.domain = void 0, EventEmitter.prototype._events = void 0, EventEmitter.prototype._maxListeners = void 0, EventEmitter.defaultMaxListeners = 10, EventEmitter.init = function () {
    this.domain = null, EventEmitter.usingDomains && (void 0).active, this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = new EventHandlers, this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
}, EventEmitter.prototype.setMaxListeners = function (n) {
    if ("number" != typeof n || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
    return this._maxListeners = n, this
}, EventEmitter.prototype.getMaxListeners = function () {
    return $getMaxListeners(this)
}, EventEmitter.prototype.emit = function (type) {
    var er, handler, len, args, i, events, domain, doError = "error" === type;
    if (events = this._events) doError = doError && null == events.error; else if (!doError) return !1;
    if (domain = this.domain, doError) {
        if (er = arguments[1], !domain) {
            if (er instanceof Error) throw er;
            var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
            throw err.context = er, err
        }
        return er || (er = new Error('Uncaught, unspecified "error" event')), er.domainEmitter = this, er.domain = domain, er.domainThrown = !1, domain.emit("error", er), !1
    }
    if (!(handler = events[type])) return !1;
    var isFn = "function" == typeof handler;
    switch (len = arguments.length) {
        case 1:
            emitNone(handler, isFn, this);
            break;
        case 2:
            emitOne(handler, isFn, this, arguments[1]);
            break;
        case 3:
            emitTwo(handler, isFn, this, arguments[1], arguments[2]);
            break;
        case 4:
            emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
            break;
        default:
            for (args = new Array(len - 1), i = 1; i < len; i++) args[i - 1] = arguments[i];
            emitMany(handler, isFn, this, args)
    }
    return !0
}, EventEmitter.prototype.addListener = function (type, listener) {
    return _addListener(this, type, listener, !1)
}, EventEmitter.prototype.on = EventEmitter.prototype.addListener, EventEmitter.prototype.prependListener = function (type, listener) {
    return _addListener(this, type, listener, !0)
}, EventEmitter.prototype.once = function (type, listener) {
    if ("function" != typeof listener) throw new TypeError('"listener" argument must be a function');
    return this.on(type, _onceWrap(this, type, listener)), this
}, EventEmitter.prototype.prependOnceListener = function (type, listener) {
    if ("function" != typeof listener) throw new TypeError('"listener" argument must be a function');
    return this.prependListener(type, _onceWrap(this, type, listener)), this
}, EventEmitter.prototype.removeListener = function (type, listener) {
    var list, events, position, i, originalListener;
    if ("function" != typeof listener) throw new TypeError('"listener" argument must be a function');
    if (!(events = this._events)) return this;
    if (!(list = events[type])) return this;
    if (list === listener || list.listener && list.listener === listener) 0 == --this._eventsCount ? this._events = new EventHandlers : (delete events[type], events.removeListener && this.emit("removeListener", type, list.listener || listener)); else if ("function" != typeof list) {
        for (position = -1, i = list.length; i-- > 0;) if (list[i] === listener || list[i].listener && list[i].listener === listener) {
            originalListener = list[i].listener, position = i;
            break
        }
        if (position < 0) return this;
        if (1 === list.length) {
            if (list[0] = void 0, 0 == --this._eventsCount) return this._events = new EventHandlers, this;
            delete events[type]
        } else !function (list, index) {
            for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) list[i] = list[k];
            list.pop()
        }(list, position);
        events.removeListener && this.emit("removeListener", type, originalListener || listener)
    }
    return this
}, EventEmitter.prototype.removeAllListeners = function (type) {
    var listeners, events;
    if (!(events = this._events)) return this;
    if (!events.removeListener) return 0 === arguments.length ? (this._events = new EventHandlers, this._eventsCount = 0) : events[type] && (0 == --this._eventsCount ? this._events = new EventHandlers : delete events[type]), this;
    if (0 === arguments.length) {
        for (var key, keys = Object.keys(events), i = 0; i < keys.length; ++i) "removeListener" !== (key = keys[i]) && this.removeAllListeners(key);
        return this.removeAllListeners("removeListener"), this._events = new EventHandlers, this._eventsCount = 0, this
    }
    if ("function" == typeof (listeners = events[type])) this.removeListener(type, listeners); else if (listeners) do {
        this.removeListener(type, listeners[listeners.length - 1])
    } while (listeners[0]);
    return this
}, EventEmitter.prototype.listeners = function (type) {
    var evlistener, events = this._events;
    return events && (evlistener = events[type]) ? "function" == typeof evlistener ? [evlistener.listener || evlistener] : function (arr) {
        for (var ret = new Array(arr.length), i = 0; i < ret.length; ++i) ret[i] = arr[i].listener || arr[i];
        return ret
    }(evlistener) : []
}, EventEmitter.listenerCount = function (emitter, type) {
    return "function" == typeof emitter.listenerCount ? emitter.listenerCount(type) : listenerCount.call(emitter, type)
}, EventEmitter.prototype.listenerCount = listenerCount, EventEmitter.prototype.eventNames = function () {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : []
};
var EventEmitter$1 = EventEmitter.EventEmitter, queue = Queue, _default = Queue;

function Queue(options) {
    if (!(this instanceof Queue)) return new Queue(options);
    EventEmitter$1.call(this), options = options || {}, this.concurrency = options.concurrency || 1 / 0, this.timeout = options.timeout || 0, this.autostart = options.autostart || !1, this.results = options.results || null, this.pending = 0, this.session = 0, this.running = !1, this.jobs = [], this.timers = {}
}

inherits_browser(Queue, EventEmitter$1);
["pop", "shift", "indexOf", "lastIndexOf"].forEach((function (method) {
    Queue.prototype[method] = function () {
        return Array.prototype[method].apply(this.jobs, arguments)
    }
})), Queue.prototype.slice = function (begin, end) {
    return this.jobs = this.jobs.slice(begin, end), this
}, Queue.prototype.reverse = function () {
    return this.jobs.reverse(), this
};

function clearTimers() {
    for (var key in this.timers) {
        var timeoutId = this.timers[key];
        delete this.timers[key], clearTimeout(timeoutId)
    }
}

function callOnErrorOrEnd(cb) {
    var self = this;

    function onerror(err) {
        self.end(err)
    }

    this.on("error", onerror), this.on("end", (function onend(err) {
        self.removeListener("error", onerror), self.removeListener("end", onend), cb(err, this.results)
    }))
}

function done(err) {
    this.session++, this.running = !1, this.emit("end", err)
}

["push", "unshift", "splice"].forEach((function (method) {
    Queue.prototype[method] = function () {
        var methodResult = Array.prototype[method].apply(this.jobs, arguments);
        return this.autostart && this.start(), methodResult
    }
})), Object.defineProperty(Queue.prototype, "length", {
    get: function () {
        return this.pending + this.jobs.length
    }
}), Queue.prototype.start = function (cb) {
    if (cb && callOnErrorOrEnd.call(this, cb), this.running = !0, !(this.pending >= this.concurrency)) if (0 !== this.jobs.length) {
        var self = this, job = this.jobs.shift(), once = !0, session = this.session, timeoutId = null, didTimeout = !1,
            resultIndex = null, timeout = job.timeout || this.timeout;
        timeout && (timeoutId = setTimeout((function () {
            didTimeout = !0, self.listeners("timeout").length > 0 ? self.emit("timeout", next, job) : next()
        }), timeout), this.timers[timeoutId] = timeoutId), this.results && (resultIndex = this.results.length, this.results[resultIndex] = null), this.pending++, self.emit("start", job);
        var promise = job(next);
        promise && promise.then && "function" == typeof promise.then && promise.then((function (result) {
            return next(null, result)
        })).catch((function (err) {
            return next(err || !0)
        })), this.running && this.jobs.length > 0 && this.start()
    } else 0 === this.pending && done.call(this);

    function next(err, result) {
        once && self.session === session && (once = !1, self.pending--, null !== timeoutId && (delete self.timers[timeoutId], clearTimeout(timeoutId)), err ? self.emit("error", err, job) : !1 === didTimeout && (null !== resultIndex && (self.results[resultIndex] = Array.prototype.slice.call(arguments, 1)), self.emit("success", result, job)), self.session === session && (0 === self.pending && 0 === self.jobs.length ? done.call(self) : self.running && self.start()))
    }
}, Queue.prototype.stop = function () {
    this.running = !1
}, Queue.prototype.end = function (err) {
    clearTimers.call(this), this.jobs.length = 0, this.pending = 0, done.call(this, err)
}, queue.default = _default;
var bmp = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0}), exports.BMP = {
        validate: buffer => "BM" === buffer.toString("ascii", 0, 2),
        calculate: buffer => ({height: Math.abs(buffer.readInt32LE(22)), width: buffer.readUInt32LE(18)})
    }
}));
unwrapExports(bmp);
bmp.BMP;
var ico = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});

    function getSizeFromOffset(buffer, offset) {
        const value = buffer.readUInt8(offset);
        return 0 === value ? 256 : value
    }

    function getImageSize(buffer, imageIndex) {
        const offset = 6 + 16 * imageIndex;
        return {height: getSizeFromOffset(buffer, offset + 1), width: getSizeFromOffset(buffer, offset)}
    }

    exports.ICO = {
        validate: buffer => 0 === buffer.readUInt16LE(0) && 1 === buffer.readUInt16LE(2), calculate(buffer) {
            const nbImages = buffer.readUInt16LE(4), imageSize = getImageSize(buffer, 0);
            if (1 === nbImages) return imageSize;
            const imgs = [imageSize];
            for (let imageIndex = 1; imageIndex < nbImages; imageIndex += 1) imgs.push(getImageSize(buffer, imageIndex));
            return {height: imageSize.height, images: imgs, width: imageSize.width}
        }
    }
}));
unwrapExports(ico);
ico.ICO;
var cur = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    exports.CUR = {
        validate: buffer => 0 === buffer.readUInt16LE(0) && 2 === buffer.readUInt16LE(2),
        calculate: buffer => ico.ICO.calculate(buffer)
    }
}));
unwrapExports(cur);
cur.CUR;
var dds = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0}), exports.DDS = {
        validate: buffer => 542327876 === buffer.readUInt32LE(0),
        calculate: buffer => ({height: buffer.readUInt32LE(12), width: buffer.readUInt32LE(16)})
    }
}));
unwrapExports(dds);
dds.DDS;
var gif = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    const gifRegexp = /^GIF8[79]a/;
    exports.GIF = {
        validate(buffer) {
            const signature = buffer.toString("ascii", 0, 6);
            return gifRegexp.test(signature)
        }, calculate: buffer => ({height: buffer.readUInt16LE(8), width: buffer.readUInt16LE(6)})
    }
}));
unwrapExports(gif);
gif.GIF;
var icns = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    const ICON_TYPE_SIZE = {
        ICON: 32,
        "ICN#": 32,
        "icm#": 16,
        icm4: 16,
        icm8: 16,
        "ics#": 16,
        ics4: 16,
        ics8: 16,
        is32: 16,
        s8mk: 16,
        icp4: 16,
        icl4: 32,
        icl8: 32,
        il32: 32,
        l8mk: 32,
        icp5: 32,
        ic11: 32,
        ich4: 48,
        ich8: 48,
        ih32: 48,
        h8mk: 48,
        icp6: 64,
        ic12: 32,
        it32: 128,
        t8mk: 128,
        ic07: 128,
        ic08: 256,
        ic13: 256,
        ic09: 512,
        ic14: 512,
        ic10: 1024
    };

    function readImageHeader(buffer, imageOffset) {
        const imageLengthOffset = imageOffset + 4;
        return [buffer.toString("ascii", imageOffset, imageLengthOffset), buffer.readUInt32BE(imageLengthOffset)]
    }

    function getImageSize(type) {
        const size = ICON_TYPE_SIZE[type];
        return {width: size, height: size, type: type}
    }

    exports.ICNS = {
        validate: buffer => "icns" === buffer.toString("ascii", 0, 4), calculate(buffer) {
            const bufferLength = buffer.length, fileLength = buffer.readUInt32BE(4);
            let imageOffset = 8, imageHeader = readImageHeader(buffer, imageOffset),
                imageSize = getImageSize(imageHeader[0]);
            if (imageOffset += imageHeader[1], imageOffset === fileLength) return imageSize;
            const result = {height: imageSize.height, images: [imageSize], width: imageSize.width};
            for (; imageOffset < fileLength && imageOffset < bufferLength;) imageHeader = readImageHeader(buffer, imageOffset), imageSize = getImageSize(imageHeader[0]), imageOffset += imageHeader[1], result.images.push(imageSize);
            return result
        }
    }
}));
unwrapExports(icns);
icns.ICNS;
var j2c = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0}), exports.J2C = {
        validate: buffer => "ff4fff51" === buffer.toString("hex", 0, 4),
        calculate: buffer => ({height: buffer.readUInt32BE(12), width: buffer.readUInt32BE(8)})
    }
}));
unwrapExports(j2c);
j2c.J2C;
var jp2 = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    const BoxTypes_ftyp = "66747970", BoxTypes_jp2h = "6a703268", BoxTypes_jp__ = "6a502020",
        BoxTypes_rreq = "72726571", parseIHDR = box => ({height: box.readUInt32BE(4), width: box.readUInt32BE(8)});
    exports.JP2 = {
        validate(buffer) {
            const signature = buffer.toString("hex", 4, 8), signatureLength = buffer.readUInt32BE(0);
            if (signature !== BoxTypes_jp__ || signatureLength < 1) return !1;
            const ftypeBoxStart = signatureLength + 4, ftypBoxLength = buffer.readUInt32BE(signatureLength);
            return buffer.slice(ftypeBoxStart, ftypeBoxStart + ftypBoxLength).toString("hex", 0, 4) === BoxTypes_ftyp
        }, calculate(buffer) {
            const signatureLength = buffer.readUInt32BE(0);
            let offset = signatureLength + 4 + buffer.readUInt16BE(signatureLength + 2);
            switch (buffer.toString("hex", offset, offset + 4)) {
                case BoxTypes_rreq:
                    return offset = offset + 4 + 4 + (box => {
                        const unit = box.readUInt8(0);
                        let offset = 1 + 2 * unit;
                        offset = offset + 2 + box.readUInt16BE(offset) * (2 + unit);
                        return offset + 2 + box.readUInt16BE(offset) * (16 + unit)
                    })(buffer.slice(offset + 4)), parseIHDR(buffer.slice(offset + 8, offset + 24));
                case BoxTypes_jp2h:
                    return parseIHDR(buffer.slice(offset + 8, offset + 24));
                default:
                    throw new TypeError("Unsupported header found: " + buffer.toString("ascii", offset, offset + 4))
            }
        }
    }
}));
unwrapExports(jp2);
jp2.JP2;
var readUInt_1 = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0}), exports.readUInt = function (buffer, bits, offset, isBigEndian) {
        return offset = offset || 0, buffer["readUInt" + bits + (isBigEndian ? "BE" : "LE")].call(buffer, offset)
    }
}));
unwrapExports(readUInt_1);
readUInt_1.readUInt;
var jpg = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});

    function isEXIF(buffer) {
        return "45786966" === buffer.toString("hex", 2, 6)
    }

    function extractSize(buffer, index) {
        return {height: buffer.readUInt16BE(index), width: buffer.readUInt16BE(index + 2)}
    }

    function validateExifBlock(buffer, index) {
        const exifBlock = buffer.slice(2, index), byteAlign = exifBlock.toString("hex", 6, 8),
            isBigEndian = "4d4d" === byteAlign;
        if (isBigEndian || "4949" === byteAlign) return function (exifBlock, isBigEndian) {
            const idfDirectoryEntries = readUInt_1.readUInt(exifBlock, 16, 14, isBigEndian);
            for (let directoryEntryNumber = 0; directoryEntryNumber < idfDirectoryEntries; directoryEntryNumber++) {
                const start = 16 + 12 * directoryEntryNumber, end = start + 12;
                if (start > exifBlock.length) return;
                const block = exifBlock.slice(start, end);
                if (274 === readUInt_1.readUInt(block, 16, 0, isBigEndian)) {
                    if (3 !== readUInt_1.readUInt(block, 16, 2, isBigEndian)) return;
                    if (1 !== readUInt_1.readUInt(block, 32, 4, isBigEndian)) return;
                    return readUInt_1.readUInt(block, 16, 8, isBigEndian)
                }
            }
        }(exifBlock, isBigEndian)
    }

    function validateBuffer(buffer, index) {
        if (index > buffer.length) throw new TypeError("Corrupt JPG, exceeded buffer limits");
        if (255 !== buffer[index]) throw new TypeError("Invalid JPG, marker table corrupted")
    }

    exports.JPG = {
        validate: buffer => "ffd8" === buffer.toString("hex", 0, 2), calculate(buffer) {
            let orientation, next;
            for (buffer = buffer.slice(4); buffer.length;) {
                const i = buffer.readUInt16BE(0);
                if (isEXIF(buffer) && (orientation = validateExifBlock(buffer, i)), validateBuffer(buffer, i), next = buffer[i + 1], 192 === next || 193 === next || 194 === next) {
                    const size = extractSize(buffer, i + 5);
                    return orientation ? {height: size.height, orientation: orientation, width: size.width} : size
                }
                buffer = buffer.slice(i + 2)
            }
            throw new TypeError("Invalid JPG, no size found")
        }
    }
}));
unwrapExports(jpg);
jpg.JPG;
var ktx = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    exports.KTX = {
        validate: buffer => "KTX 11" === buffer.toString("ascii", 1, 7),
        calculate: buffer => ({height: buffer.readUInt32LE(40), width: buffer.readUInt32LE(36)})
    }
}));
unwrapExports(ktx);
ktx.KTX;
var png = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    exports.PNG = {
        validate(buffer) {
            if ("PNG\r\n\n" === buffer.toString("ascii", 1, 8)) {
                let chunkName = buffer.toString("ascii", 12, 16);
                if ("CgBI" === chunkName && (chunkName = buffer.toString("ascii", 28, 32)), "IHDR" !== chunkName) throw new TypeError("Invalid PNG");
                return !0
            }
            return !1
        },
        calculate: buffer => "CgBI" === buffer.toString("ascii", 12, 16) ? {
            height: buffer.readUInt32BE(36),
            width: buffer.readUInt32BE(32)
        } : {height: buffer.readUInt32BE(20), width: buffer.readUInt32BE(16)}
    }
}));
unwrapExports(png);
png.PNG;
var pnm = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    const PNMTypes = {
        P1: "pbm/ascii",
        P2: "pgm/ascii",
        P3: "ppm/ascii",
        P4: "pbm",
        P5: "pgm",
        P6: "ppm",
        P7: "pam",
        PF: "pfm"
    }, Signatures = Object.keys(PNMTypes), handlers = {
        default: lines => {
            let dimensions = [];
            for (; lines.length > 0;) {
                const line = lines.shift();
                if ("#" !== line[0]) {
                    dimensions = line.split(" ");
                    break
                }
            }
            if (2 === dimensions.length) return {
                height: parseInt(dimensions[1], 10),
                width: parseInt(dimensions[0], 10)
            };
            throw new TypeError("Invalid PNM")
        }, pam: lines => {
            const size = {};
            for (; lines.length > 0;) {
                const line = lines.shift();
                if (line.length > 16 || line.charCodeAt(0) > 128) continue;
                const [key, value] = line.split(" ");
                if (key && value && (size[key.toLowerCase()] = parseInt(value, 10)), size.height && size.width) break
            }
            if (size.height && size.width) return {height: size.height, width: size.width};
            throw new TypeError("Invalid PAM")
        }
    };
    exports.PNM = {
        validate(buffer) {
            const signature = buffer.toString("ascii", 0, 2);
            return Signatures.includes(signature)
        }, calculate(buffer) {
            const signature = buffer.toString("ascii", 0, 2), type = PNMTypes[signature],
                lines = buffer.toString("ascii", 3).split(/[\r\n]+/);
            return (handlers[type] || handlers.default)(lines)
        }
    }
}));
unwrapExports(pnm);
pnm.PNM;
var psd = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0}), exports.PSD = {
        validate: buffer => "8BPS" === buffer.toString("ascii", 0, 4),
        calculate: buffer => ({height: buffer.readUInt32BE(14), width: buffer.readUInt32BE(18)})
    }
}));
unwrapExports(psd);
psd.PSD;
var svg = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    const svgReg = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/, extractorRegExps = {
        height: /\sheight=(['"])([^%]+?)\1/,
        root: svgReg,
        viewbox: /\sviewBox=(['"])(.+?)\1/,
        width: /\swidth=(['"])([^%]+?)\1/
    }, units = {cm: 96 / 2.54, em: 16, ex: 8, m: 96 / 2.54 * 100, mm: 96 / 2.54 / 10, pc: 96 / 72 / 12, pt: 96 / 72};

    function parseLength(len) {
        const m = /([0-9.]+)([a-z]*)/.exec(len);
        if (m) return Math.round(parseFloat(m[1]) * (units[m[2]] || 1))
    }

    function parseViewbox(viewbox) {
        const bounds = viewbox.split(" ");
        return {height: parseLength(bounds[3]), width: parseLength(bounds[2])}
    }

    exports.SVG = {
        validate(buffer) {
            const str = String(buffer);
            return svgReg.test(str)
        }, calculate(buffer) {
            const root = buffer.toString("utf8").match(extractorRegExps.root);
            if (root) {
                const attrs = function (root) {
                    const width = root.match(extractorRegExps.width), height = root.match(extractorRegExps.height),
                        viewbox = root.match(extractorRegExps.viewbox);
                    return {
                        height: height && parseLength(height[2]),
                        viewbox: viewbox && parseViewbox(viewbox[2]),
                        width: width && parseLength(width[2])
                    }
                }(root[0]);
                if (attrs.width && attrs.height) return function (attrs) {
                    return {height: attrs.height, width: attrs.width}
                }(attrs);
                if (attrs.viewbox) return function (attrs, viewbox) {
                    const ratio = viewbox.width / viewbox.height;
                    return attrs.width ? {
                        height: Math.floor(attrs.width / ratio),
                        width: attrs.width
                    } : attrs.height ? {
                        height: attrs.height,
                        width: Math.floor(attrs.height * ratio)
                    } : {height: viewbox.height, width: viewbox.width}
                }(attrs, attrs.viewbox)
            }
            throw new TypeError("Invalid SVG")
        }
    }
}));
unwrapExports(svg);
svg.SVG;
var tiff = createCommonjsModule((function (module, exports) {
    function readValue(buffer, isBigEndian) {
        const low = readUInt_1.readUInt(buffer, 16, 8, isBigEndian);
        return (readUInt_1.readUInt(buffer, 16, 10, isBigEndian) << 16) + low
    }

    function nextTag(buffer) {
        if (buffer.length > 24) return buffer.slice(12)
    }

    Object.defineProperty(exports, "__esModule", {value: !0});
    const signatures = ["49492a00", "4d4d002a"];
    exports.TIFF = {
        validate: buffer => signatures.includes(buffer.toString("hex", 0, 4)), calculate(buffer, filepath) {
            if (!filepath) throw new TypeError("Tiff doesn't support buffer");
            const isBigEndian = "BE" === function (buffer) {
                const signature = buffer.toString("ascii", 0, 2);
                return "II" === signature ? "LE" : "MM" === signature ? "BE" : void 0
            }(buffer), tags = function (buffer, isBigEndian) {
                const tags = {};
                let temp = buffer;
                for (; temp && temp.length;) {
                    const code = readUInt_1.readUInt(temp, 16, 0, isBigEndian),
                        type = readUInt_1.readUInt(temp, 16, 2, isBigEndian),
                        length = readUInt_1.readUInt(temp, 32, 4, isBigEndian);
                    if (0 === code) break;
                    1 !== length || 3 !== type && 4 !== type || (tags[code] = readValue(temp, isBigEndian)), temp = nextTag(temp)
                }
                return tags
            }(function (buffer, filepath, isBigEndian) {
                const ifdOffset = readUInt_1.readUInt(buffer, 32, 4, isBigEndian);
                let bufferSize = 1024;
                const fileSize = fs.statSync(filepath).size;
                ifdOffset + bufferSize > fileSize && (bufferSize = fileSize - ifdOffset - 10);
                const endBuffer = Buffer.alloc(bufferSize), descriptor = fs.openSync(filepath, "r");
                return fs.readSync(descriptor, endBuffer, 0, bufferSize, ifdOffset), endBuffer.slice(2)
            }(buffer, filepath, isBigEndian), isBigEndian), width = tags[256], height = tags[257];
            if (!width || !height) throw new TypeError("Invalid Tiff. Missing tags");
            return {height: height, width: width}
        }
    }
}));
unwrapExports(tiff);
tiff.TIFF;
var webp = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0}), exports.WEBP = {
        validate(buffer) {
            const riffHeader = "RIFF" === buffer.toString("ascii", 0, 4),
                webpHeader = "WEBP" === buffer.toString("ascii", 8, 12),
                vp8Header = "VP8" === buffer.toString("ascii", 12, 15);
            return riffHeader && webpHeader && vp8Header
        }, calculate(buffer) {
            const chunkHeader = buffer.toString("ascii", 12, 16);
            if (buffer = buffer.slice(20, 30), "VP8X" === chunkHeader) {
                const extendedHeader = buffer[0], validEnd = 0 == (1 & extendedHeader);
                if (0 == (192 & extendedHeader) && validEnd) return function (buffer) {
                    return {height: 1 + buffer.readUIntLE(7, 3), width: 1 + buffer.readUIntLE(4, 3)}
                }(buffer);
                throw new TypeError("Invalid WebP")
            }
            if ("VP8 " === chunkHeader && 47 !== buffer[0]) return function (buffer) {
                return {height: 16383 & buffer.readInt16LE(8), width: 16383 & buffer.readInt16LE(6)}
            }(buffer);
            const signature = buffer.toString("hex", 3, 6);
            if ("VP8L" === chunkHeader && "9d012a" !== signature) return function (buffer) {
                return {
                    height: 1 + ((15 & buffer[4]) << 10 | buffer[3] << 2 | (192 & buffer[2]) >> 6),
                    width: 1 + ((63 & buffer[2]) << 8 | buffer[1])
                }
            }(buffer);
            throw new TypeError("Invalid WebP")
        }
    }
}));
unwrapExports(webp);
webp.WEBP;
var types = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0}), exports.typeHandlers = {
        bmp: bmp.BMP,
        cur: cur.CUR,
        dds: dds.DDS,
        gif: gif.GIF,
        icns: icns.ICNS,
        ico: ico.ICO,
        j2c: j2c.J2C,
        jp2: jp2.JP2,
        jpg: jpg.JPG,
        ktx: ktx.KTX,
        png: png.PNG,
        pnm: pnm.PNM,
        psd: psd.PSD,
        svg: svg.SVG,
        tiff: tiff.TIFF,
        webp: webp.WEBP
    }
}));
unwrapExports(types);
types.typeHandlers;
var detector_1 = createCommonjsModule((function (module, exports) {
    Object.defineProperty(exports, "__esModule", {value: !0});
    const keys = Object.keys(types.typeHandlers), firstBytes = {
        56: "psd",
        66: "bmp",
        68: "dds",
        71: "gif",
        73: "tiff",
        77: "tiff",
        82: "webp",
        105: "icns",
        137: "png",
        255: "jpg"
    };
    exports.detector = function (buffer) {
        const byte = buffer[0];
        if (byte in firstBytes) {
            const type = firstBytes[byte];
            if (types.typeHandlers[type].validate(buffer)) return type
        }
        return keys.find(key => types.typeHandlers[key].validate(buffer))
    }
}));
unwrapExports(detector_1);
detector_1.detector;
unwrapExports(createCommonjsModule((function (module, exports) {
    if (Object.defineProperty(exports, "__esModule", {value: !0}), !("promises" in fs)) {
        class FileHandle {
            constructor(fd) {
                this.fd = fd
            }

            stat() {
                return new Promise((resolve, reject) => {
                    fs.fstat(this.fd, (err, stats) => {
                        err ? reject(err) : resolve(stats)
                    })
                })
            }

            read(buffer, offset, length, position) {
                return new Promise((resolve, reject) => {
                    fs.read(this.fd, buffer, offset, length, position, err => {
                        err ? reject(err) : resolve()
                    })
                })
            }

            close() {
                return new Promise((resolve, reject) => {
                    fs.close(this.fd, err => {
                        err ? reject(err) : resolve()
                    })
                })
            }
        }

        Object.defineProperty(fs, "promises", {
            value: {
                open: (filepath, flags) => new Promise((resolve, reject) => {
                    fs.open(filepath, flags, (err, fd) => {
                        err ? reject(err) : resolve(new FileHandle(fd))
                    })
                })
            }, writable: !1
        })
    }
})));
var dist = createCommonjsModule((function (module, exports) {
    var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))((function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }

            function rejected(value) {
                try {
                    step(generator.throw(value))
                } catch (e) {
                    reject(e)
                }
            }

            function step(result) {
                var value;
                result.done ? resolve(result.value) : (value = result.value, value instanceof P ? value : new P((function (resolve) {
                    resolve(value)
                }))).then(fulfilled, rejected)
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next())
        }))
    };
    Object.defineProperty(exports, "__esModule", {value: !0});
    const queue$1 = new queue.default({concurrency: 100, autostart: !0});

    function lookup(buffer, filepath) {
        const type = detector_1.detector(buffer);
        if (type && type in types.typeHandlers) {
            const size = types.typeHandlers[type].calculate(buffer, filepath);
            if (void 0 !== size) return size.type = type, size
        }
        throw new TypeError("unsupported file type: " + type + " (file: " + filepath + ")")
    }

    function imageSize(input, callback) {
        if (Buffer.isBuffer(input)) return lookup(input);
        if ("string" != typeof input) throw new TypeError("invalid invocation");
        const filepath = path.resolve(input);
        if ("function" != typeof callback) {
            return lookup(function (filepath) {
                const descriptor = fs.openSync(filepath, "r"), size = fs.fstatSync(descriptor).size,
                    bufferSize = Math.min(size, 524288), buffer = Buffer.alloc(bufferSize);
                return fs.readSync(descriptor, buffer, 0, bufferSize, 0), fs.closeSync(descriptor), buffer
            }(filepath), filepath)
        }
        queue$1.push(() => function (filepath) {
            return __awaiter(this, void 0, void 0, (function* () {
                const handle = yield fs.promises.open(filepath, "r"), {size: size} = yield handle.stat();
                if (size <= 0) throw new Error("Empty file");
                const bufferSize = Math.min(size, 524288), buffer = Buffer.alloc(bufferSize);
                return yield handle.read(buffer, 0, bufferSize, 0), yield handle.close(), buffer
            }))
        }(filepath).then(buffer => process.nextTick(callback, null, lookup(buffer, filepath))).catch(callback))
    }

    module.exports = exports = imageSize, exports.imageSize = imageSize, exports.setConcurrency = c => {
        queue$1.concurrency = c
    }, exports.types = Object.keys(types.typeHandlers)
})), sizeOf = unwrapExports(dist);
dist.imageSize, dist.setConcurrency, dist.types;
const namespaces_a = "http://schemas.openxmlformats.org/drawingml/2006/main",
    namespaces_cdr = "http://schemas.openxmlformats.org/drawingml/2006/chartDrawing",
    namespaces_dc = "http://purl.org/dc/elements/1.1/", namespaces_dcmitype = "http://purl.org/dc/dcmitype/",
    namespaces_dcterms = "http://purl.org/dc/terms/", namespaces_o = "urn:schemas-microsoft-com:office:office",
    namespaces_pic = "http://schemas.openxmlformats.org/drawingml/2006/picture",
    namespaces_r = "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    namespaces_v = "urn:schemas-microsoft-com:vml",
    namespaces_ve = "http://schemas.openxmlformats.org/markup-compatibility/2006",
    namespaces_vt = "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes",
    namespaces_w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    namespaces_w10 = "urn:schemas-microsoft-com:office:word",
    namespaces_wp = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    namespaces_wne = "http://schemas.microsoft.com/office/word/2006/wordml",
    namespaces_xsi = "http://www.w3.org/2001/XMLSchema-instance",
    namespaces_numbering = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering",
    namespaces_hyperlinks = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
    namespaces_images = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
    namespaces_styles = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
    namespaces_headers = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header",
    namespaces_footers = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer",
    namespaces_themes = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
    namespaces_coreProperties = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
    namespaces_officeDocumentRelation = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
    namespaces_corePropertiesRelation = "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties",
    namespaces_settingsRelation = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings",
    namespaces_webSettingsRelation = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings",
    namespaces_sl = "http://schemas.openxmlformats.org/schemaLibrary/2006/main",
    rgbRegex = /rgb\((\d+),\s*([\d.]+),\s*([\d.]+)\)/i, hslRegex = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i,
    hexRegex = /#([0-9A-F]{6})/i, hex3Regex = /#([0-9A-F])([0-9A-F])([0-9A-F])/i,
    rgbToHex = (red, green, blue) => [red, green, blue].map(x => 1 === (x = parseInt(x).toString(16)).length ? "0" + x : x).join(""),
    pixelRegex = /([\d.]+)px/i, percentageRegex = /([\d.]+)%/i, pointRegex = /(\d+)pt/i, cmRegex = /([\d.]+)cm/i,
    inchRegex = /([\d.]+)in/i, pixelToEMU = pixelValue => Math.round(9525 * pixelValue),
    EMUToTWIP = EMUValue => Math.round(EMUValue / 635), pointToTWIP = pointValue => Math.round(20 * pointValue),
    pointToHIP = pointValue => Math.round(2 * pointValue),
    pixelToTWIP = pixelValue => EMUToTWIP(pixelToEMU(pixelValue)), pixelToHIP = pixelValue => {
        return TWIPValue = EMUToTWIP(pixelToEMU(pixelValue)), Math.round(TWIPValue / 10);
        var TWIPValue
    }, inchToTWIP = inchValue => pointToTWIP((inchValue => Math.round(72 * inchValue))(inchValue)),
    pixelToPoint = pixelValue => {
        return HIPValue = pixelToHIP(pixelValue), Math.round(HIPValue / 2);
        var HIPValue
    }, pointToEIP = PointValue => Math.round(8 * PointValue), fixupColorCode = colorCodeString => {
        if (Object.prototype.hasOwnProperty.call(colorNames, colorCodeString.toLowerCase())) {
            const [red, green, blue] = colorNames[colorCodeString.toLowerCase()];
            return rgbToHex(red, green, blue)
        }
        if (rgbRegex.test(colorCodeString)) {
            const matchedParts = colorCodeString.match(rgbRegex), red = matchedParts[1], green = matchedParts[2],
                blue = matchedParts[3];
            return rgbToHex(red, green, blue)
        }
        if (hslRegex.test(colorCodeString)) {
            const matchedParts = colorCodeString.match(hslRegex);
            return ((hue, saturation, luminosity) => {
                let red, green, blue;
                if (hue /= 360, luminosity /= 100, 0 === (saturation /= 100)) red = green = blue = luminosity; else {
                    const hue2rgb = (p, q, t) => (t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? p + 6 * (q - p) * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p),
                        q = luminosity < .5 ? luminosity * (1 + saturation) : luminosity + saturation - luminosity * saturation,
                        p = 2 * luminosity - q;
                    red = hue2rgb(p, q, hue + 1 / 3), green = hue2rgb(p, q, hue), blue = hue2rgb(p, q, hue - 1 / 3)
                }
                return [red, green, blue].map(x => {
                    const hex = Math.round(255 * x).toString(16);
                    return 1 === hex.length ? "0" + hex : hex
                }).join("")
            })(matchedParts[1], matchedParts[2], matchedParts[3])
        }
        if (hexRegex.test(colorCodeString)) {
            return colorCodeString.match(hexRegex)[1]
        }
        if (hex3Regex.test(colorCodeString)) {
            const matchedParts = colorCodeString.match(hex3Regex);
            return ((red, green, blue) => [red, green, blue].map(x => `${x}${x}`).join(""))(matchedParts[1], matchedParts[2], matchedParts[3])
        }
        return "000000"
    },
    buildRunFontFragment = (fontName = "Times New Roman") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "rFonts").att("@w", "ascii", fontName).att("@w", "hAnsi", fontName).up(),
    buildShading = colorCode => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "shd").att("@w", "val", "clear").att("@w", "fill", colorCode).up(),
    buildHighlight = (color = "yellow") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "highlight").att("@w", "val", color).up(),
    buildVertAlign = (type = "baseline") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "vertAlign").att("@w", "val", type).up(),
    buildBold = () => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "b").up(),
    buildItalics = () => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "i").up(),
    buildUnderline = (type = "single") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "u").att("@w", "val", type).up(),
    buildBorder = (borderSide = "top", borderSize = 0, borderSpacing = 0, borderColor = fixupColorCode("black"), borderStroke = "single") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", borderSide).att("@w", "val", borderStroke).att("@w", "sz", borderSize).att("@w", "space", borderSpacing).att("@w", "color", borderColor).up(),
    buildTextElement = text => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "t").att("@xml", "space", "preserve").txt(text).up(),
    buildRunProperties = attributes => {
        const runPropertiesFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "rPr");
        return attributes && attributes.constructor === Object && Object.keys(attributes).forEach(key => {
            switch (key) {
                case"strong":
                    const boldFragment = buildBold();
                    runPropertiesFragment.import(boldFragment);
                    break;
                case"i":
                    const italicsFragment = buildItalics();
                    runPropertiesFragment.import(italicsFragment);
                    break;
                case"u":
                    const underlineFragment = buildUnderline();
                    runPropertiesFragment.import(underlineFragment);
                    break;
                case"color":
                    const colorFragment = (colorCode = attributes[key], fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "color").att("@w", "val", colorCode).up());
                    runPropertiesFragment.import(colorFragment);
                    break;
                case"backgroundColor":
                    const shadingFragment = buildShading(attributes[key]);
                    runPropertiesFragment.import(shadingFragment);
                    break;
                case"fontSize":
                    const fontSizeFragment = (fontSize = attributes[key], fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "sz").att("@w", "val", fontSize).up());
                    runPropertiesFragment.import(fontSizeFragment);
                    break;
                case"hyperlink":
                    const hyperlinkStyleFragment = ((type = "Hyperlink") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "rStyle").att("@w", "val", type).up())("Hyperlink");
                    runPropertiesFragment.import(hyperlinkStyleFragment);
                    break;
                case"highlightColor":
                    const highlightFragment = buildHighlight(attributes[key]);
                    runPropertiesFragment.import(highlightFragment);
                    break;
                case"font":
                    const runFontFragment = buildRunFontFragment("Courier");
                    runPropertiesFragment.import(runFontFragment)
            }
            var fontSize, colorCode
        }), runPropertiesFragment.up(), runPropertiesFragment
    }, buildTextFormatting = vNode => {
        switch (vNode.tagName) {
            case"strong":
            case"b":
                return buildBold();
            case"em":
            case"i":
                return buildItalics();
            case"ins":
            case"u":
                return buildUnderline();
            case"strike":
            case"del":
            case"s":
                return fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "strike").att("@w", "val", !0).up();
            case"sub":
                return buildVertAlign("subscript");
            case"sup":
                return buildVertAlign("superscript");
            case"mark":
                return buildHighlight();
            case"code":
                return buildHighlight("lightGray");
            case"pre":
                return buildRunFontFragment("Courier")
        }
    }, buildRun = (vNode, attributes) => {
        const runFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "r"),
            runPropertiesFragment = buildRunProperties(attributes);
        if (isVnode(vNode) && ["span", "strong", "b", "em", "i", "u", "ins", "strike", "del", "s", "sub", "sup", "mark", "blockquote", "code", "pre"].includes(vNode.tagName)) {
            const textArray = [];
            let vNodes = [vNode];
            for (; vNodes.length;) {
                const tempVNode = vNodes.shift();
                if (isVtext(tempVNode) && textArray.push(tempVNode.text), isVnode(tempVNode) && ["strong", "b", "em", "i", "u", "ins", "strike", "del", "s", "sub", "sup", "mark", "code", "pre"].includes(tempVNode.tagName)) {
                    const formattingFragment = buildTextFormatting(tempVNode);
                    runPropertiesFragment.import(formattingFragment)
                }
                tempVNode.children && tempVNode.children.length && (vNodes = tempVNode.children.slice().concat(vNodes))
            }
            if (textArray.length) {
                const combinedString = textArray.join("");
                vNode = new VText(combinedString)
            }
        }
        if (runFragment.import(runPropertiesFragment), isVtext(vNode)) {
            const textFragment = buildTextElement(vNode.text);
            runFragment.import(textFragment)
        } else if (attributes && "picture" === attributes.type) {
            const {type: type, inlineOrAnchored: inlineOrAnchored, ...otherAttributes} = attributes,
                imageFragment = buildDrawing(inlineOrAnchored, type, otherAttributes);
            runFragment.import(imageFragment)
        } else if (isVnode(vNode) && "br" === vNode.tagName) {
            const lineBreakFragment = ((type = "textWrapping") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "br").att("@w", "type", type).up())();
            runFragment.import(lineBreakFragment)
        }
        return runFragment.up(), runFragment
    }, fixupLineHeight = (lineHeight, fontSize) => {
        if (isNaN(lineHeight)) return 240;
        if (fontSize) {
            return HIPValue = +lineHeight * fontSize, Math.round(10 * HIPValue)
        }
        return 240 * +lineHeight;
        var HIPValue
    }, fixupFontSize = fontSizeString => {
        if (pointRegex.test(fontSizeString)) {
            const matchedParts = fontSizeString.match(pointRegex);
            return pointToHIP(matchedParts[1])
        }
        if (pixelRegex.test(fontSizeString)) {
            const matchedParts = fontSizeString.match(pixelRegex);
            return pixelToHIP(matchedParts[1])
        }
    }, buildRunOrRuns = (vNode, attributes) => {
        if (isVnode(vNode) && "span" === vNode.tagName) {
            const runFragments = [];
            for (let index = 0; index < vNode.children.length; index++) {
                const childVNode = vNode.children[index], modifiedAttributes = {...attributes};
                isVnode(vNode) && vNode.properties && vNode.properties.style && (vNode.properties.style.color && !["transparent", "auto"].includes(vNode.properties.style.color) && (modifiedAttributes.color = fixupColorCode(vNode.properties.style.color)), vNode.properties.style["background-color"] && !["transparent", "auto"].includes(vNode.properties.style["background-color"]) && (modifiedAttributes.backgroundColor = fixupColorCode(vNode.properties.style["background-color"])), vNode.properties.style["font-size"] && (modifiedAttributes.fontSize = fixupFontSize(vNode.properties.style["font-size"]))), runFragments.push(buildRun(childVNode, modifiedAttributes))
            }
            return runFragments
        }
        return buildRun(vNode, attributes)
    }, buildRunOrHyperLink = (vNode, attributes, docxDocumentInstance) => {
        if (isVnode(vNode) && "a" === vNode.tagName) {
            const relationshipId = docxDocumentInstance.createDocumentRelationships(docxDocumentInstance.relationshipFilename, "hyperlink", vNode.properties && vNode.properties.href ? vNode.properties.href : ""),
                hyperlinkFragment = fragment({
                    namespaceAlias: {
                        w: namespaces_w,
                        r: namespaces_r
                    }
                }).ele("@w", "hyperlink").att("@r", "id", "rId" + relationshipId), modifiedAttributes = {...attributes};
            modifiedAttributes.hyperlink = !0;
            const runFragments = buildRunOrRuns(vNode.children[0], modifiedAttributes);
            if (Array.isArray(runFragments)) for (let index = 0; index < runFragments.length; index++) {
                const runFragment = runFragments[index];
                hyperlinkFragment.import(runFragment)
            } else hyperlinkFragment.import(runFragments);
            return hyperlinkFragment.up(), hyperlinkFragment
        }
        return buildRunOrRuns(vNode, attributes)
    }, buildHorizontalAlignment = horizontalAlignment => {
        "justify" === horizontalAlignment && (horizontalAlignment = "both");
        return fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "jc").att("@w", "val", horizontalAlignment).up()
    }, buildParagraphProperties = attributes => {
        const paragraphPropertiesFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "pPr");
        if (attributes && attributes.constructor === Object) {
            Object.keys(attributes).forEach(key => {
                switch (key) {
                    case"numbering":
                        const {levelId: levelId, numberingId: numberingId} = attributes[key],
                            numberingPropertiesFragment = ((levelId, numberingId) => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "numPr").ele("@w", "ilvl").att("@w", "val", String(levelId)).up().ele("@w", "numId").att("@w", "val", String(numberingId)).up().up())(levelId, numberingId);
                        paragraphPropertiesFragment.import(numberingPropertiesFragment), delete attributes.numbering;
                        break;
                    case"textAlign":
                        const horizontalAlignmentFragment = buildHorizontalAlignment(attributes[key]);
                        paragraphPropertiesFragment.import(horizontalAlignmentFragment), delete attributes.textAlign;
                        break;
                    case"backgroundColor":
                        if ("block" === attributes.display) {
                            const shadingFragment = buildShading(attributes[key]);
                            paragraphPropertiesFragment.import(shadingFragment);
                            const paragraphBorderFragment = (() => {
                                const paragraphBorderFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "pBdr"),
                                    bordersObject = {
                                        top: {size: 0, spacing: 3, color: "FFFFFF"},
                                        left: {size: 0, spacing: 3, color: "FFFFFF"},
                                        bottom: {size: 0, spacing: 3, color: "FFFFFF"},
                                        right: {size: 0, spacing: 3, color: "FFFFFF"}
                                    };
                                return Object.keys(bordersObject).forEach(borderName => {
                                    if (bordersObject[borderName]) {
                                        const {size: size, spacing: spacing, color: color} = bordersObject[borderName],
                                            borderFragment = buildBorder(borderName, size, spacing, color);
                                        paragraphBorderFragment.import(borderFragment)
                                    }
                                }), paragraphBorderFragment.up(), paragraphBorderFragment
                            })();
                            paragraphPropertiesFragment.import(paragraphBorderFragment), delete attributes.backgroundColor
                        }
                        break;
                    case"paragraphStyle":
                        const pStyleFragment = ((style = "Normal") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "pStyle").att("@w", "val", style).up())(attributes.paragraphStyle);
                        paragraphPropertiesFragment.import(pStyleFragment), delete attributes.paragraphStyle;
                        break;
                    case"indentation":
                        const indentationFragment = ((left = 720) => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "ind").att("@w", "left", left).up())(attributes[key].left);
                        paragraphPropertiesFragment.import(indentationFragment), delete attributes.indentation
                }
            });
            const spacingFragment = ((lineSpacing, beforeSpacing, afterSpacing) => {
                const spacingFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "spacing");
                return lineSpacing && spacingFragment.att("@w", "line", lineSpacing), beforeSpacing && spacingFragment.att("@w", "before", beforeSpacing), afterSpacing && spacingFragment.att("@w", "after", afterSpacing), spacingFragment.att("@w", "lineRule", "auto").up(), spacingFragment
            })(attributes.lineHeight, attributes.beforeSpacing, attributes.afterSpacing);
            delete attributes.lineHeight, delete attributes.beforeSpacing, delete attributes.afterSpacing, paragraphPropertiesFragment.import(spacingFragment)
        }
        return paragraphPropertiesFragment.up(), paragraphPropertiesFragment
    }, computeImageDimensions = (vNode, attributes) => {
        const {maximumWidth: maximumWidth, originalWidth: originalWidth, originalHeight: originalHeight} = attributes,
            aspectRatio = originalWidth / originalHeight,
            maximumWidthInEMU = (TWIPValue = maximumWidth, Math.round(635 * TWIPValue));
        var TWIPValue;
        let modifiedHeight, modifiedWidth, originalWidthInEMU = pixelToEMU(originalWidth),
            originalHeightInEMU = pixelToEMU(originalHeight);
        if (originalWidthInEMU > maximumWidthInEMU && (originalWidthInEMU = maximumWidthInEMU, originalHeightInEMU = Math.round(originalWidthInEMU / aspectRatio)), vNode.properties && vNode.properties.style) {
            if (vNode.properties.style.width) if ("auto" !== vNode.properties.style.width) {
                if (pixelRegex.test(vNode.properties.style.width)) modifiedWidth = pixelToEMU(vNode.properties.style.width.match(pixelRegex)[1]); else if (percentageRegex.test(vNode.properties.style.width)) {
                    const percentageValue = vNode.properties.style.width.match(percentageRegex)[1];
                    modifiedWidth = Math.round(percentageValue / 100 * originalWidthInEMU)
                }
            } else vNode.properties.style.height && "auto" === vNode.properties.style.height && (modifiedWidth = originalWidthInEMU, modifiedHeight = originalHeightInEMU);
            if (vNode.properties.style.height) if ("auto" !== vNode.properties.style.height) {
                if (pixelRegex.test(vNode.properties.style.height)) modifiedHeight = pixelToEMU(vNode.properties.style.height.match(pixelRegex)[1]); else if (percentageRegex.test(vNode.properties.style.height)) {
                    const percentageValue = vNode.properties.style.width.match(percentageRegex)[1];
                    modifiedHeight = Math.round(percentageValue / 100 * originalHeightInEMU), modifiedWidth || (modifiedWidth = Math.round(modifiedHeight * aspectRatio))
                }
            } else modifiedWidth ? modifiedHeight || (modifiedHeight = Math.round(modifiedWidth / aspectRatio)) : (modifiedHeight = originalHeightInEMU, modifiedWidth = originalWidthInEMU);
            modifiedWidth && !modifiedHeight ? modifiedHeight = Math.round(modifiedWidth / aspectRatio) : modifiedHeight && !modifiedWidth && (modifiedWidth = Math.round(modifiedHeight * aspectRatio))
        } else modifiedWidth = originalWidthInEMU, modifiedHeight = originalHeightInEMU;
        attributes.width = modifiedWidth, attributes.height = modifiedHeight
    }, buildParagraph = (vNode, attributes, docxDocumentInstance) => {
        const paragraphFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "p"),
            modifiedAttributes = {...attributes};
        isVnode(vNode) && vNode.properties && vNode.properties.style && (vNode.properties.style.color && !["transparent", "auto"].includes(vNode.properties.style.color) && (modifiedAttributes.color = fixupColorCode(vNode.properties.style.color)), vNode.properties.style["background-color"] && !["transparent", "auto"].includes(vNode.properties.style["background-color"]) && (modifiedAttributes.backgroundColor = fixupColorCode(vNode.properties.style["background-color"])), vNode.properties.style["vertical-align"] && ["top", "middle", "bottom"].includes(vNode.properties.style["vertical-align"]) && (modifiedAttributes.verticalAlign = vNode.properties.style["vertical-align"]), vNode.properties.style["text-align"] && ["left", "right", "center", "justify"].includes(vNode.properties.style["text-align"]) && (modifiedAttributes.textAlign = vNode.properties.style["text-align"]), vNode.properties.style["font-weight"] && "bold" === vNode.properties.style["font-weight"] && (modifiedAttributes.strong = vNode.properties.style["font-weight"]), vNode.properties.style["font-size"] && (modifiedAttributes.fontSize = fixupFontSize(vNode.properties.style["font-size"])), vNode.properties.style["line-height"] && (modifiedAttributes.lineHeight = fixupLineHeight(vNode.properties.style["line-height"], vNode.properties.style["font-size"] ? fixupFontSize(vNode.properties.style["font-size"]) : null)), vNode.properties.style.display && (modifiedAttributes.display = vNode.properties.style.display)), isVnode(vNode) && "blockquote" === vNode.tagName ? (modifiedAttributes.indentation = {left: 284}, modifiedAttributes.textAlign = "justify") : isVnode(vNode) && "code" === vNode.tagName ? modifiedAttributes.highlightColor = "lightGray" : isVnode(vNode) && "pre" === vNode.tagName && (modifiedAttributes.font = "Courier");
        const paragraphPropertiesFragment = buildParagraphProperties(modifiedAttributes);
        if (paragraphFragment.import(paragraphPropertiesFragment), isVnode(vNode) && vNode.children && Array.isArray(vNode.children) && vNode.children.length) if (["span", "strong", "b", "em", "i", "u", "ins", "strike", "del", "s", "sub", "sup", "mark", "a", "code", "pre"].includes(vNode.tagName)) {
            const runOrHyperlinkFragments = buildRunOrHyperLink(vNode, modifiedAttributes, docxDocumentInstance);
            if (Array.isArray(runOrHyperlinkFragments)) for (let iteratorIndex = 0; iteratorIndex < runOrHyperlinkFragments.length; iteratorIndex++) {
                const runOrHyperlinkFragment = runOrHyperlinkFragments[iteratorIndex];
                paragraphFragment.import(runOrHyperlinkFragment)
            } else paragraphFragment.import(runOrHyperlinkFragments)
        } else if ("blockquote" === vNode.tagName) {
            const runFragment = buildRun(vNode, attributes);
            paragraphFragment.import(runFragment)
        } else for (let index = 0; index < vNode.children.length; index++) {
            const childVNode = vNode.children[index],
                runOrHyperlinkFragments = buildRunOrHyperLink(childVNode, modifiedAttributes, docxDocumentInstance);
            if (Array.isArray(runOrHyperlinkFragments)) for (let iteratorIndex = 0; iteratorIndex < runOrHyperlinkFragments.length; iteratorIndex++) {
                const runOrHyperlinkFragment = runOrHyperlinkFragments[iteratorIndex];
                paragraphFragment.import(runOrHyperlinkFragment)
            } else paragraphFragment.import(runOrHyperlinkFragments)
        } else {
            isVnode(vNode) && "img" === vNode.tagName && computeImageDimensions(vNode, modifiedAttributes);
            const runFragments = buildRunOrRuns(vNode, modifiedAttributes);
            if (Array.isArray(runFragments)) for (let index = 0; index < runFragments.length; index++) {
                const runFragment = runFragments[index];
                paragraphFragment.import(runFragment)
            } else paragraphFragment.import(runFragments)
        }
        return paragraphFragment.up(), paragraphFragment
    }, buildTableCellProperties = attributes => {
        const tableCellPropertiesFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tcPr");
        return attributes && attributes.constructor === Object && Object.keys(attributes).forEach(key => {
            switch (key) {
                case"backgroundColor":
                    const shadingFragment = buildShading(attributes[key]);
                    tableCellPropertiesFragment.import(shadingFragment), delete attributes.backgroundColor;
                    break;
                case"verticalAlign":
                    const verticalAlignmentFragment = (verticalAlignment => {
                        "middle" === verticalAlignment.toLowerCase() && (verticalAlignment = "center");
                        return fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "vAlign").att("@w", "val", verticalAlignment).up()
                    })(attributes[key]);
                    tableCellPropertiesFragment.import(verticalAlignmentFragment), delete attributes.verticalAlign;
                    break;
                case"colSpan":
                    const gridSpanFragment = (spanValue = attributes[key], fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "gridSpan").att("@w", "val", spanValue).up());
                    tableCellPropertiesFragment.import(gridSpanFragment), delete attributes.colSpan;
                    break;
                case"tableCellBorder":
                    const tableCellBorderFragment = (tableCellBorder => {
                        const tableCellBordersFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tcBorders"), {
                            color: color,
                            stroke: stroke,
                            ...borders
                        } = tableCellBorder;
                        return Object.keys(borders).forEach(border => {
                            if (tableCellBorder[border]) {
                                const borderFragment = buildBorder(border, tableCellBorder[border], 0, color, stroke);
                                tableCellBordersFragment.import(borderFragment)
                            }
                        }), tableCellBordersFragment.up(), tableCellBordersFragment
                    })(attributes[key]);
                    tableCellPropertiesFragment.import(tableCellBorderFragment), delete attributes.tableCellBorder;
                    break;
                case"rowSpan":
                    const verticalMergeFragment = ((verticalMerge = "continue") => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "vMerge").att("@w", "val", verticalMerge).up())(attributes[key]);
                    tableCellPropertiesFragment.import(verticalMergeFragment), delete attributes.rowSpan
            }
            var spanValue
        }), tableCellPropertiesFragment.up(), tableCellPropertiesFragment
    }, fixupTableCellBorder = (vNode, attributes) => {
        if (Object.prototype.hasOwnProperty.call(vNode.properties.style, "border")) if ("none" === vNode.properties.style.border || 0 === vNode.properties.style.border) attributes.tableCellBorder = {}; else {
            const [borderSize, borderStroke, borderColor] = cssBorderParser(vNode.properties.style.border);
            attributes.tableCellBorder = {
                top: borderSize,
                left: borderSize,
                bottom: borderSize,
                right: borderSize,
                color: borderColor,
                stroke: borderStroke
            }
        }
        if (vNode.properties.style["border-top"] && "0" === vNode.properties.style["border-top"]) attributes.tableCellBorder = {
            ...attributes.tableCellBorder,
            top: 0
        }; else if (vNode.properties.style["border-top"] && "0" !== vNode.properties.style["border-top"]) {
            const [borderSize, borderStroke, borderColor] = cssBorderParser(vNode.properties.style["border-top"]);
            attributes.tableCellBorder = {
                ...attributes.tableCellBorder,
                top: borderSize,
                color: borderColor,
                stroke: borderStroke
            }
        }
        if (vNode.properties.style["border-left"] && "0" === vNode.properties.style["border-left"]) attributes.tableCellBorder = {
            ...attributes.tableCellBorder,
            left: 0
        }; else if (vNode.properties.style["border-left"] && "0" !== vNode.properties.style["border-left"]) {
            const [borderSize, borderStroke, borderColor] = cssBorderParser(vNode.properties.style["border-left"]);
            attributes.tableCellBorder = {
                ...attributes.tableCellBorder,
                left: borderSize,
                color: borderColor,
                stroke: borderStroke
            }
        }
        if (vNode.properties.style["border-bottom"] && "0" === vNode.properties.style["border-bottom"]) attributes.tableCellBorder = {
            ...attributes.tableCellBorder,
            bottom: 0
        }; else if (vNode.properties.style["border-bottom"] && "0" !== vNode.properties.style["border-bottom"]) {
            const [borderSize, borderStroke, borderColor] = cssBorderParser(vNode.properties.style["border-bottom"]);
            attributes.tableCellBorder = {
                ...attributes.tableCellBorder,
                bottom: borderSize,
                color: borderColor,
                stroke: borderStroke
            }
        }
        if (vNode.properties.style["border-right"] && "0" === vNode.properties.style["border-right"]) attributes.tableCellBorder = {
            ...attributes.tableCellBorder,
            right: 0
        }; else if (vNode.properties.style["border-right"] && "0" !== vNode.properties.style["border-right"]) {
            const [borderSize, borderStroke, borderColor] = cssBorderParser(vNode.properties.style["border-right"]);
            attributes.tableCellBorder = {
                ...attributes.tableCellBorder,
                right: borderSize,
                color: borderColor,
                stroke: borderStroke
            }
        }
    }, buildTableCell = (vNode, attributes, rowSpanMap, columnIndex, docxDocumentInstance) => {
        const tableCellFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tc"),
            modifiedAttributes = {...attributes};
        if (isVnode(vNode) && vNode.properties) {
            if (vNode.properties.rowSpan) rowSpanMap.set(columnIndex.index, {
                rowSpan: vNode.properties.rowSpan - 1,
                colSpan: 0
            }), modifiedAttributes.rowSpan = "restart"; else {
                const previousSpanObject = rowSpanMap.get(columnIndex.index);
                rowSpanMap.set(columnIndex.index, Object.assign({}, previousSpanObject, {
                    rowSpan: 0,
                    colSpan: previousSpanObject && previousSpanObject.colSpan || 0
                }))
            }
            if (vNode.properties.colSpan || vNode.properties.style && vNode.properties.style["column-span"]) {
                modifiedAttributes.colSpan = vNode.properties.colSpan || vNode.properties.style && vNode.properties.style["column-span"];
                const previousSpanObject = rowSpanMap.get(columnIndex.index);
                rowSpanMap.set(columnIndex.index, Object.assign({}, previousSpanObject, {colSpan: parseInt(modifiedAttributes.colSpan) || 0})), columnIndex.index += parseInt(modifiedAttributes.colSpan) - 1
            }
            vNode.properties.style && (vNode.properties.style.color && !["transparent", "auto"].includes(vNode.properties.style.color) && (modifiedAttributes.color = fixupColorCode(vNode.properties.style.color)), vNode.properties.style["background-color"] && !["transparent", "auto"].includes(vNode.properties.style["background-color"]) && (modifiedAttributes.backgroundColor = fixupColorCode(vNode.properties.style["background-color"])), vNode.properties.style["vertical-align"] && ["top", "middle", "bottom"].includes(vNode.properties.style["vertical-align"]) && (modifiedAttributes.verticalAlign = vNode.properties.style["vertical-align"]), fixupTableCellBorder(vNode, modifiedAttributes))
        }
        const tableCellPropertiesFragment = buildTableCellProperties(modifiedAttributes);
        if (tableCellFragment.import(tableCellPropertiesFragment), vNode.children && Array.isArray(vNode.children) && vNode.children.length) for (let index = 0; index < vNode.children.length; index++) {
            const childVNode = vNode.children[index];
            if (isVnode(childVNode) && "img" === childVNode.tagName) {
                const imageFragment = buildImage(docxDocumentInstance, childVNode, modifiedAttributes.maximumWidth);
                imageFragment && tableCellFragment.import(imageFragment)
            } else if (isVnode(childVNode) && "figure" === childVNode.tagName) {
                if (childVNode.children && Array.isArray(childVNode.children) && childVNode.children.length) for (let iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
                    const grandChildVNode = childVNode.children[iteratorIndex];
                    if ("img" === grandChildVNode.tagName) {
                        const imageFragment = buildImage(docxDocumentInstance, grandChildVNode, modifiedAttributes.maximumWidth);
                        imageFragment && tableCellFragment.import(imageFragment)
                    }
                }
            } else {
                const paragraphFragment = buildParagraph(childVNode, modifiedAttributes, docxDocumentInstance);
                tableCellFragment.import(paragraphFragment)
            }
        } else {
            const paragraphFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "p").up();
            tableCellFragment.import(paragraphFragment)
        }
        return tableCellFragment.up(), tableCellFragment
    }, buildRowSpanCell = (rowSpanMap, columnIndex, attributes) => {
        const rowSpanCellFragments = [];
        let spanObject = rowSpanMap.get(columnIndex.index);
        for (; spanObject && spanObject.rowSpan;) {
            const rowSpanCellFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tc"),
                tableCellPropertiesFragment = buildTableCellProperties({
                    ...attributes,
                    rowSpan: "continue",
                    colSpan: spanObject.colSpan ? spanObject.colSpan : 0
                });
            rowSpanCellFragment.import(tableCellPropertiesFragment);
            const paragraphFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "p").up();
            rowSpanCellFragment.import(paragraphFragment), rowSpanCellFragment.up(), rowSpanCellFragments.push(rowSpanCellFragment), spanObject.rowSpan - 1 == 0 ? rowSpanMap.delete(columnIndex.index) : rowSpanMap.set(columnIndex.index, {
                rowSpan: spanObject.rowSpan - 1,
                colSpan: spanObject.colSpan || 0
            }), columnIndex.index += spanObject.colSpan || 1, spanObject = rowSpanMap.get(columnIndex.index)
        }
        return rowSpanCellFragments
    }, buildTableRowProperties = attributes => {
        const tableRowPropertiesFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "trPr");
        return attributes && attributes.constructor === Object && Object.keys(attributes).forEach(key => {
            switch (key) {
                case"tableRowHeight":
                    const tableRowHeightFragment = (tableRowHeight = attributes[key], fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "trHeight").att("@w", "val", tableRowHeight).att("@w", "hRule", "atLeast").up());
                    tableRowPropertiesFragment.import(tableRowHeightFragment), delete attributes.tableRowHeight;
                    break;
                case"rowCantSplit":
                    if (attributes.rowCantSplit) {
                        const cantSplitFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "cantSplit").up();
                        tableRowPropertiesFragment.import(cantSplitFragment), delete attributes.rowCantSplit
                    }
            }
            var tableRowHeight
        }), tableRowPropertiesFragment.up(), tableRowPropertiesFragment
    }, buildTableRow = (vNode, attributes, rowSpanMap, docxDocumentInstance) => {
        const tableRowFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tr"),
            modifiedAttributes = {...attributes};
        isVnode(vNode) && vNode.properties && ((vNode.properties.style && vNode.properties.style.height || vNode.children[0] && isVnode(vNode.children[0]) && vNode.children[0].properties.style && vNode.children[0].properties.style.height) && (modifiedAttributes.tableRowHeight = (rowHeightString => {
            if (pointRegex.test(rowHeightString)) {
                const matchedParts = rowHeightString.match(pointRegex);
                return pointToTWIP(matchedParts[1])
            }
            if (pixelRegex.test(rowHeightString)) {
                const matchedParts = rowHeightString.match(pixelRegex);
                return pixelToTWIP(matchedParts[1])
            }
        })(vNode.properties.style && vNode.properties.style.height || (vNode.children[0] && isVnode(vNode.children[0]) && vNode.children[0].properties.style && vNode.children[0].properties.style.height ? vNode.children[0].properties.style.height : void 0))), vNode.properties.style && fixupTableCellBorder(vNode, modifiedAttributes));
        const tableRowPropertiesFragment = buildTableRowProperties(modifiedAttributes);
        tableRowFragment.import(tableRowPropertiesFragment);
        const columnIndex = {index: 0};
        if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
            const tableColumns = vNode.children.filter(childVNode => ["td", "th"].includes(childVNode.tagName)),
                columnWidth = docxDocumentInstance.availableDocumentSpace / tableColumns.length;
            for (let index = 0; index < vNode.children.length; index++) {
                const childVNode = vNode.children[index];
                if (["td", "th"].includes(childVNode.tagName)) {
                    const rowSpanCellFragments = buildRowSpanCell(rowSpanMap, columnIndex, modifiedAttributes);
                    if (Array.isArray(rowSpanCellFragments)) for (let iteratorIndex = 0; iteratorIndex < rowSpanCellFragments.length; iteratorIndex++) {
                        const rowSpanCellFragment = rowSpanCellFragments[iteratorIndex];
                        tableRowFragment.import(rowSpanCellFragment)
                    }
                    const tableCellFragment = buildTableCell(childVNode, {
                        ...modifiedAttributes,
                        maximumWidth: columnWidth
                    }, rowSpanMap, columnIndex, docxDocumentInstance);
                    columnIndex.index++, tableRowFragment.import(tableCellFragment)
                }
            }
        }
        if (columnIndex.index < rowSpanMap.size) {
            const rowSpanCellFragments = buildRowSpanCell(rowSpanMap, columnIndex, modifiedAttributes);
            if (Array.isArray(rowSpanCellFragments)) for (let iteratorIndex = 0; iteratorIndex < rowSpanCellFragments.length; iteratorIndex++) {
                const rowSpanCellFragment = rowSpanCellFragments[iteratorIndex];
                tableRowFragment.import(rowSpanCellFragment)
            }
        }
        return tableRowFragment.up(), tableRowFragment
    },
    buildTableGridCol = gridWidth => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "gridCol").att("@w", "w", String(gridWidth)),
    buildTableGrid = (vNode, attributes) => {
        const tableGridFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tblGrid");
        if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
            const gridColumns = vNode.children.filter(childVNode => "col" === childVNode.tagName),
                gridWidth = attributes.maximumWidth / gridColumns.length;
            for (let index = 0; index < gridColumns.length; index++) {
                const tableGridColFragment = buildTableGridCol(gridWidth);
                tableGridFragment.import(tableGridColFragment)
            }
        }
        return tableGridFragment.up(), tableGridFragment
    }, buildTableGridFromTableRow = (vNode, attributes) => {
        const tableGridFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tblGrid");
        if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
            const numberOfGridColumns = vNode.children.reduce((accumulator, childVNode) => {
                const colSpan = childVNode.properties.colSpan || childVNode.properties.style && childVNode.properties.style["column-span"];
                return accumulator + (colSpan ? parseInt(colSpan) : 1)
            }, 0), gridWidth = attributes.maximumWidth / numberOfGridColumns;
            for (let index = 0; index < numberOfGridColumns; index++) {
                const tableGridColFragment = buildTableGridCol(gridWidth);
                tableGridFragment.import(tableGridColFragment)
            }
        }
        return tableGridFragment.up(), tableGridFragment
    },
    buildCellMargin = (side, margin) => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", side).att("@w", "type", "dxa").att("@w", "w", String(margin)).up(),
    buildTableProperties = attributes => {
        const tablePropertiesFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tblPr");
        attributes && attributes.constructor === Object && Object.keys(attributes).forEach(key => {
            switch (key) {
                case"tableBorder":
                    const tableBordersFragment = (tableBorder => {
                        const tableBordersFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tblBorders"), {
                            color: color,
                            stroke: stroke,
                            ...borders
                        } = tableBorder;
                        return Object.keys(borders).forEach(border => {
                            if (borders[border]) {
                                const borderFragment = buildBorder(border, borders[border], 0, color, stroke);
                                tableBordersFragment.import(borderFragment)
                            }
                        }), tableBordersFragment.up(), tableBordersFragment
                    })(attributes[key]);
                    tablePropertiesFragment.import(tableBordersFragment), delete attributes.tableBorder;
                    break;
                case"tableCellSpacing":
                    const tableCellSpacingFragment = ((cellSpacing = 0) => fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tblCellSpacing").att("@w", "w", cellSpacing).att("@w", "type", "dxa").up())(attributes[key]);
                    tablePropertiesFragment.import(tableCellSpacingFragment), delete attributes.tableCellSpacing;
                    break;
                case"width":
                    if (attributes[key]) {
                        const tableWidthFragment = (tableWidth = attributes[key], fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tblW").att("@w", "type", "dxa").att("@w", "w", String(tableWidth)).up());
                        tablePropertiesFragment.import(tableWidthFragment)
                    }
                    delete attributes.width
            }
            var tableWidth
        });
        const tableCellMarginFragment = (margin => {
            const tableCellMarFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tblCellMar");
            return ["top", "bottom"].forEach(side => {
                const marginFragment = buildCellMargin(side, margin / 2);
                tableCellMarFragment.import(marginFragment)
            }), ["left", "right"].forEach(side => {
                const marginFragment = buildCellMargin(side, margin);
                tableCellMarFragment.import(marginFragment)
            }), tableCellMarFragment
        })(160);
        tablePropertiesFragment.import(tableCellMarginFragment);
        const alignmentFragment = buildHorizontalAlignment("center");
        return tablePropertiesFragment.import(alignmentFragment), tablePropertiesFragment.up(), tablePropertiesFragment
    }, cssBorderParser = borderString => {
        let [size, stroke, color] = borderString.split(" ");
        if (pointRegex.test(size)) {
            const matchedParts = size.match(pointRegex);
            size = pointToEIP(matchedParts[1])
        } else if (pixelRegex.test(size)) {
            const matchedParts = size.match(pixelRegex);
            pixelValue = matchedParts[1], size = pointToEIP(pixelToPoint(pixelValue))
        }
        var pixelValue;
        return stroke = stroke && ["dashed", "dotted", "double"].includes(stroke) ? stroke : "single", color = color && fixupColorCode(color).toUpperCase(), [size, stroke, color]
    }, buildTable = (vNode, attributes, docxDocumentInstance) => {
        const tableFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "tbl"),
            modifiedAttributes = {...attributes};
        if (isVnode(vNode) && vNode.properties) {
            const tableAttributes = vNode.properties.attributes || {}, tableStyles = vNode.properties.style || {},
                tableBorders = {}, tableCellBorders = {};
            let minimumWidth, maximumWidth, width, [borderSize, borderStrike, borderColor] = [2, "single", "000000"];
            if (isNaN(tableAttributes.border) || (borderSize = parseInt(tableAttributes.border, 10)), tableStyles.border) {
                const [cssSize, cssStroke, cssColor] = cssBorderParser(tableStyles.border);
                borderSize = cssSize || borderSize, borderColor = cssColor || borderColor, borderStrike = cssStroke || borderStrike
            }
            if (tableBorders.top = borderSize, tableBorders.bottom = borderSize, tableBorders.left = borderSize, tableBorders.right = borderSize, tableBorders.stroke = borderStrike, tableBorders.color = borderColor, "collapse" === tableStyles["border-collapse"] ? (tableBorders.insideV = borderSize, tableBorders.insideH = borderSize) : (tableBorders.insideV = 0, tableBorders.insideH = 0, tableCellBorders.top = 1, tableCellBorders.bottom = 1, tableCellBorders.left = 1, tableCellBorders.right = 1), modifiedAttributes.tableBorder = tableBorders, modifiedAttributes.tableCellSpacing = 0, Object.keys(tableCellBorders).length && (modifiedAttributes.tableCellBorder = tableCellBorders), pixelRegex.test(tableStyles["min-width"])) minimumWidth = pixelToTWIP(tableStyles["min-width"].match(pixelRegex)[1]); else if (percentageRegex.test(tableStyles["min-width"])) {
                const percentageValue = tableStyles["min-width"].match(percentageRegex)[1];
                minimumWidth = Math.round(percentageValue / 100 * attributes.maximumWidth)
            }
            if (pixelRegex.test(tableStyles["max-width"])) pixelRegex.lastIndex = 0, maximumWidth = pixelToTWIP(tableStyles["max-width"].match(pixelRegex)[1]); else if (percentageRegex.test(tableStyles["max-width"])) {
                percentageRegex.lastIndex = 0;
                const percentageValue = tableStyles["max-width"].match(percentageRegex)[1];
                maximumWidth = Math.round(percentageValue / 100 * attributes.maximumWidth)
            }
            if (pixelRegex.test(tableStyles.width)) pixelRegex.lastIndex = 0, width = pixelToTWIP(tableStyles.width.match(pixelRegex)[1]); else if (percentageRegex.test(tableStyles.width)) {
                percentageRegex.lastIndex = 0;
                const percentageValue = tableStyles.width.match(percentageRegex)[1];
                width = Math.round(percentageValue / 100 * attributes.maximumWidth)
            }
            width ? (modifiedAttributes.width = width, maximumWidth && (modifiedAttributes.width = Math.min(modifiedAttributes.width, maximumWidth)), minimumWidth && (modifiedAttributes.width = Math.max(modifiedAttributes.width, minimumWidth))) : minimumWidth && (modifiedAttributes.width = minimumWidth), modifiedAttributes.width && (modifiedAttributes.width = Math.min(modifiedAttributes.width, attributes.maximumWidth))
        }
        const tablePropertiesFragment = buildTableProperties(modifiedAttributes);
        tableFragment.import(tablePropertiesFragment);
        const rowSpanMap = new Map;
        if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) for (let index = 0; index < vNode.children.length; index++) {
            const childVNode = vNode.children[index];
            if ("colgroup" === childVNode.tagName) {
                const tableGridFragment = buildTableGrid(childVNode, modifiedAttributes);
                tableFragment.import(tableGridFragment)
            } else if ("thead" === childVNode.tagName) for (let iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
                const grandChildVNode = childVNode.children[iteratorIndex];
                if ("tr" === grandChildVNode.tagName) {
                    if (0 === iteratorIndex) {
                        const tableGridFragment = buildTableGridFromTableRow(grandChildVNode, modifiedAttributes);
                        tableFragment.import(tableGridFragment)
                    }
                    const tableRowFragment = buildTableRow(grandChildVNode, modifiedAttributes, rowSpanMap, docxDocumentInstance);
                    tableFragment.import(tableRowFragment)
                }
            } else if ("tbody" === childVNode.tagName) for (let iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
                const grandChildVNode = childVNode.children[iteratorIndex];
                if ("tr" === grandChildVNode.tagName) {
                    if (0 === iteratorIndex) {
                        const tableGridFragment = buildTableGridFromTableRow(grandChildVNode, modifiedAttributes);
                        tableFragment.import(tableGridFragment)
                    }
                    const tableRowFragment = buildTableRow(grandChildVNode, modifiedAttributes, rowSpanMap, docxDocumentInstance);
                    tableFragment.import(tableRowFragment)
                }
            } else if ("tr" === childVNode.tagName) {
                if (0 === index) {
                    const tableGridFragment = buildTableGridFromTableRow(childVNode, modifiedAttributes);
                    tableFragment.import(tableGridFragment)
                }
                const tableRowFragment = buildTableRow(childVNode, modifiedAttributes, rowSpanMap, docxDocumentInstance);
                tableFragment.import(tableRowFragment)
            }
        }
        return tableFragment.up(), tableFragment
    }, buildGraphicFrameTransform = attributes => {
        const graphicFrameTransformFragment = fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "xfrm"),
            offsetFragment = fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "off").att("x", "0").att("y", "0").up();
        graphicFrameTransformFragment.import(offsetFragment);
        const extentsFragment = (({
                                      width: width,
                                      height: height
                                  }) => fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "ext").att("cx", width).att("cy", height).up())(attributes);
        return graphicFrameTransformFragment.import(extentsFragment), graphicFrameTransformFragment.up(), graphicFrameTransformFragment
    }, buildShapeProperties = attributes => {
        const shapeProperties = fragment({namespaceAlias: {pic: namespaces_pic}}).ele("@pic", "spPr"),
            graphicFrameTransformFragment = buildGraphicFrameTransform(attributes);
        shapeProperties.import(graphicFrameTransformFragment);
        const presetGeometryFragment = fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "prstGeom").att("prst", "rect").up();
        return shapeProperties.import(presetGeometryFragment), shapeProperties.up(), shapeProperties
    }, buildStretch = () => {
        const stretchFragment = fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "stretch"),
            fillRectFragment = fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "fillRect").up();
        return stretchFragment.import(fillRectFragment), stretchFragment.up(), stretchFragment
    }, buildBinaryLargeImageOrPictureFill = relationshipId => {
        const binaryLargeImageOrPictureFillFragment = fragment({namespaceAlias: {pic: namespaces_pic}}).ele("@pic", "blipFill"),
            binaryLargeImageOrPictureFragment = (relationshipId => {
                const binaryLargeImageOrPictureFragment = fragment({
                    namespaceAlias: {
                        a: namespaces_a,
                        r: namespaces_r
                    }
                }).ele("@a", "blip").att("@r", "embed", "rId" + relationshipId).att("cstate", "print");
                return binaryLargeImageOrPictureFragment.up(), binaryLargeImageOrPictureFragment
            })(relationshipId);
        binaryLargeImageOrPictureFillFragment.import(binaryLargeImageOrPictureFragment);
        const srcRectFragment = fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "srcRect").att("b", "0").att("l", "0").att("r", "0").att("t", "0").up();
        binaryLargeImageOrPictureFillFragment.import(srcRectFragment);
        const stretchFragment = buildStretch();
        return binaryLargeImageOrPictureFillFragment.import(stretchFragment), binaryLargeImageOrPictureFillFragment.up(), binaryLargeImageOrPictureFillFragment
    }, buildNonVisualPictureProperties = (pictureId, pictureNameWithExtension, pictureDescription) => {
        const nonVisualPicturePropertiesFragment = fragment({namespaceAlias: {pic: namespaces_pic}}).ele("@pic", "nvPicPr"),
            nonVisualDrawingPropertiesFragment = ((pictureId, pictureNameWithExtension, pictureDescription = "") => {
                const nonVisualDrawingPropertiesFragment = fragment({namespaceAlias: {pic: namespaces_pic}}).ele("@pic", "cNvPr").att("id", pictureId).att("name", pictureNameWithExtension).att("descr", pictureDescription);
                return nonVisualDrawingPropertiesFragment.up(), nonVisualDrawingPropertiesFragment
            })(pictureId, pictureNameWithExtension, pictureDescription);
        nonVisualPicturePropertiesFragment.import(nonVisualDrawingPropertiesFragment);
        const nonVisualPictureDrawingPropertiesFragment = (() => {
            const nonVisualPictureDrawingPropertiesFragment = fragment({namespaceAlias: {pic: namespaces_pic}}).ele("@pic", "cNvPicPr");
            return nonVisualPictureDrawingPropertiesFragment.up(), nonVisualPictureDrawingPropertiesFragment
        })();
        return nonVisualPicturePropertiesFragment.import(nonVisualPictureDrawingPropertiesFragment), nonVisualPicturePropertiesFragment.up(), nonVisualPicturePropertiesFragment
    }, buildGraphicData = (graphicType, attributes) => {
        const graphicDataFragment = fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "graphicData").att("uri", "http://schemas.openxmlformats.org/drawingml/2006/picture");
        if ("picture" === graphicType) {
            const pictureFragment = (({
                                          id: id,
                                          fileNameWithExtension: fileNameWithExtension,
                                          description: description,
                                          relationshipId: relationshipId,
                                          width: width,
                                          height: height
                                      }) => {
                const pictureFragment = fragment({namespaceAlias: {pic: namespaces_pic}}).ele("@pic", "pic"),
                    nonVisualPicturePropertiesFragment = buildNonVisualPictureProperties(id, fileNameWithExtension, description);
                pictureFragment.import(nonVisualPicturePropertiesFragment);
                const binaryLargeImageOrPictureFill = buildBinaryLargeImageOrPictureFill(relationshipId);
                pictureFragment.import(binaryLargeImageOrPictureFill);
                const shapeProperties = buildShapeProperties({width: width, height: height});
                return pictureFragment.import(shapeProperties), pictureFragment.up(), pictureFragment
            })(attributes);
            graphicDataFragment.import(pictureFragment)
        }
        return graphicDataFragment.up(), graphicDataFragment
    }, buildGraphic = (graphicType, attributes) => {
        const graphicFragment = fragment({namespaceAlias: {a: namespaces_a}}).ele("@a", "graphic"),
            graphicDataFragment = buildGraphicData(graphicType, attributes);
        return graphicFragment.import(graphicDataFragment), graphicFragment.up(), graphicFragment
    },
    buildDrawingObjectNonVisualProperties = (pictureId, pictureName) => fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "docPr").att("id", pictureId).att("name", pictureName).up(),
    buildEffectExtentFragment = () => fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "effectExtent").att("b", "0").att("l", "0").att("r", "0").att("t", "0").up(),
    buildExtent = ({
                       width: width,
                       height: height
                   }) => fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "extent").att("cx", width).att("cy", height).up(),
    buildAnchoredDrawing = (graphicType, attributes) => {
        const anchoredDrawingFragment = fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "anchor").att("distB", "0").att("distL", "0").att("distR", "0").att("distT", "0").att("relativeHeight", "0").att("behindDoc", "false").att("locked", "true").att("layoutInCell", "true").att("allowOverlap", "false").att("simplePos", "false"),
            simplePosFragment = fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "simplePos").att("x", "0").att("y", "0").up();
        anchoredDrawingFragment.import(simplePosFragment);
        const positionHFragment = fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "positionH").att("relativeFrom", "column").ele("@wp", "posOffset").txt("19050").up().up();
        anchoredDrawingFragment.import(positionHFragment);
        const positionVFragment = fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "positionV").att("relativeFrom", "paragraph").ele("@wp", "posOffset").txt("19050").up().up();
        anchoredDrawingFragment.import(positionVFragment);
        const extentFragment = buildExtent({width: attributes.width, height: attributes.height});
        anchoredDrawingFragment.import(extentFragment);
        const effectExtentFragment = buildEffectExtentFragment();
        anchoredDrawingFragment.import(effectExtentFragment);
        const wrapSquareFragment = fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "wrapSquare").att("wrapText", "bothSides").att("distB", "228600").att("distT", "228600").att("distL", "228600").att("distR", "228600").up();
        anchoredDrawingFragment.import(wrapSquareFragment);
        const drawingObjectNonVisualPropertiesFragment = buildDrawingObjectNonVisualProperties(attributes.id, attributes.fileNameWithExtension);
        anchoredDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
        const graphicFragment = buildGraphic(graphicType, attributes);
        return anchoredDrawingFragment.import(graphicFragment), anchoredDrawingFragment.up(), anchoredDrawingFragment
    }, buildDrawing = (inlineOrAnchored = !1, graphicType, attributes) => {
        const drawingFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "drawing"),
            inlineOrAnchoredDrawingFragment = inlineOrAnchored ? ((graphicType, attributes) => {
                const inlineDrawingFragment = fragment({namespaceAlias: {wp: namespaces_wp}}).ele("@wp", "inline").att("distB", "0").att("distL", "0").att("distR", "0").att("distT", "0"),
                    extentFragment = buildExtent({width: attributes.width, height: attributes.height});
                inlineDrawingFragment.import(extentFragment);
                const effectExtentFragment = buildEffectExtentFragment();
                inlineDrawingFragment.import(effectExtentFragment);
                const drawingObjectNonVisualPropertiesFragment = buildDrawingObjectNonVisualProperties(attributes.id, attributes.fileNameWithExtension);
                inlineDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
                const graphicFragment = buildGraphic(graphicType, attributes);
                return inlineDrawingFragment.import(graphicFragment), inlineDrawingFragment.up(), inlineDrawingFragment
            })(graphicType, attributes) : buildAnchoredDrawing(graphicType, attributes);
        return drawingFragment.import(inlineOrAnchoredDrawingFragment), drawingFragment.up(), drawingFragment
    }, convertHTML = HTMLToVDOM_({VNode: vnode, VText: vtext}),
    buildImage = (docxDocumentInstance, vNode, maximumWidth = null) => {
        let response = null;
        try {
            response = docxDocumentInstance.createMediaFile(decodeURIComponent(vNode.properties.src))
        } catch (error) {
        }
        if (response) {
            docxDocumentInstance.zip.folder("word").folder("media").file(response.fileNameWithExtension, Buffer.from(response.fileContent, "base64"), {createFolders: !1});
            const documentRelsId = docxDocumentInstance.createDocumentRelationships(docxDocumentInstance.relationshipFilename, "image", "media/" + response.fileNameWithExtension, "Internal"),
                imageBuffer = Buffer.from(response.fileContent, "base64"), imageProperties = sizeOf(imageBuffer);
            console.log(imageProperties);
            console.log(buildParagraph(vNode, {
                type: "picture",
                inlineOrAnchored: !0,
                relationshipId: documentRelsId, ...response,
                maximumWidth: maximumWidth || docxDocumentInstance.availableDocumentSpace,
                originalWidth: imageProperties.width,
                originalHeight: imageProperties.height
            }, docxDocumentInstance));
            return buildParagraph(vNode, {
                type: "picture",
                inlineOrAnchored: !0,
                relationshipId: documentRelsId, ...response,
                maximumWidth: maximumWidth || docxDocumentInstance.availableDocumentSpace,
                originalWidth: imageProperties.width,
                originalHeight: imageProperties.height
            }, docxDocumentInstance)
        }
    };

function findXMLEquivalent(docxDocumentInstance, vNode, xmlFragment) {
    if ("div" === vNode.tagName && ("page-break" === vNode.properties.attributes.class || vNode.properties.style && vNode.properties.style["page-break-after"])) {
        const paragraphFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "p").ele("@w", "r").ele("@w", "br").att("@w", "type", "page").up().up().up();
        xmlFragment.import(paragraphFragment)
    } else {
        switch (vNode.tagName) {
            case"h1":
            case"h2":
            case"h3":
            case"h4":
            case"h5":
            case"h6":
                const headingFragment = buildParagraph(vNode, {paragraphStyle: "Heading" + vNode.tagName[1]}, docxDocumentInstance);
                return void xmlFragment.import(headingFragment);
            case"span":
            case"strong":
            case"b":
            case"em":
            case"i":
            case"u":
            case"ins":
            case"strike":
            case"del":
            case"s":
            case"sub":
            case"sup":
            case"mark":
            case"p":
            case"a":
            case"blockquote":
            case"code":
            case"pre":
                const paragraphFragment = buildParagraph(vNode, {}, docxDocumentInstance);
                return void xmlFragment.import(paragraphFragment);
            case"figure":
                if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) for (let index = 0; index < vNode.children.length; index++) {
                    const childVNode = vNode.children[index];
                    if ("table" === childVNode.tagName) {
                        const tableFragment = buildTable(childVNode, {
                            maximumWidth: docxDocumentInstance.availableDocumentSpace,
                            rowCantSplit: docxDocumentInstance.tableRowCantSplit
                        }, docxDocumentInstance);
                        xmlFragment.import(tableFragment);
                        const emptyParagraphFragment = buildParagraph(null, {});
                        xmlFragment.import(emptyParagraphFragment)
                    } else if ("img" === childVNode.tagName) {
                        const imageFragment = buildImage(docxDocumentInstance, childVNode);
                        imageFragment && xmlFragment.import(imageFragment)
                    }
                }
                return;
            case"table":
                const tableFragment = buildTable(vNode, {
                    maximumWidth: docxDocumentInstance.availableDocumentSpace,
                    rowCantSplit: docxDocumentInstance.tableRowCantSplit
                }, docxDocumentInstance);
                xmlFragment.import(tableFragment);
                const emptyParagraphFragment = buildParagraph(null, {});
                return void xmlFragment.import(emptyParagraphFragment);
            case"ol":
            case"ul":
                const listElements = (vNode => {
                    const listElements = [];
                    let vNodeObjects = [{node: vNode, level: 0, type: vNode.tagName}];
                    for (; vNodeObjects.length;) {
                        const tempVNodeObject = vNodeObjects.shift();
                        if ((isVtext(tempVNodeObject.node) || isVnode(tempVNodeObject.node) && !["ul", "ol", "li"].includes(tempVNodeObject.node.tagName)) && listElements.push({
                            node: tempVNodeObject.node,
                            level: tempVNodeObject.level,
                            type: tempVNodeObject.type
                        }), tempVNodeObject.node.children && tempVNodeObject.node.children.length && ["ul", "ol", "li"].includes(tempVNodeObject.node.tagName)) {
                            vNodeObjects = tempVNodeObject.node.children.reduce((accumulator, childVNode) => {
                                if (["ul", "ol"].includes(childVNode.tagName)) accumulator.push({
                                    node: childVNode,
                                    level: tempVNodeObject.level + 1,
                                    type: childVNode.tagName
                                }); else if (accumulator.length > 0 && isVnode(accumulator[accumulator.length - 1].node) && "p" === accumulator[accumulator.length - 1].node.tagName.toLowerCase()) accumulator[accumulator.length - 1].node.children.push(childVNode); else {
                                    const paragraphVNode = new vnode("p", null, isVtext(childVNode) ? [childVNode] : isVnode(childVNode) ? "li" === childVNode.tagName.toLowerCase() ? [...childVNode.children] : [childVNode] : []);
                                    accumulator.push({
                                        node: isVnode(childVNode) ? "li" === childVNode.tagName.toLowerCase() ? childVNode : "p" !== childVNode.tagName.toLowerCase() ? paragraphVNode : childVNode : paragraphVNode,
                                        level: tempVNodeObject.level,
                                        type: tempVNodeObject.type
                                    })
                                }
                                return accumulator
                            }, []).concat(vNodeObjects)
                        }
                    }
                    return listElements
                })(vNode), numberingId = docxDocumentInstance.createNumbering(listElements);
                for (let index = 0; index < listElements.length; index++) {
                    const listElement = listElements[index], paragraphFragment = buildParagraph(listElement.node, {
                        numbering: {
                            levelId: listElement.level,
                            numberingId: numberingId
                        }
                    }, docxDocumentInstance);
                    xmlFragment.import(paragraphFragment)
                }
                return;
            case"img":
                const imageFragment = buildImage(docxDocumentInstance, vNode);
                return void (imageFragment && xmlFragment.import(imageFragment));
            case"br":
                const linebreakFragment = buildParagraph(null, {});
                return void xmlFragment.import(linebreakFragment)
        }
        if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) for (let index = 0; index < vNode.children.length; index++) {
            convertVTreeToXML(docxDocumentInstance, vNode.children[index], xmlFragment)
        }
    }
}

function convertVTreeToXML(docxDocumentInstance, vTree, xmlFragment) {
    if (!vTree) return "";
    if (Array.isArray(vTree) && vTree.length) for (let index = 0; index < vTree.length; index++) {
        convertVTreeToXML(docxDocumentInstance, vTree[index], xmlFragment)
    } else isVnode(vTree) ? findXMLEquivalent(docxDocumentInstance, vTree, xmlFragment) : isVtext(vTree) && buildTextElement(xmlFragment, escape(String(vTree.text)));
    return xmlFragment
}

const documentRelsXML = `\n  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n    <Relationship Id="rId1" Type="${namespaces_numbering}" Target="numbering.xml"/>\n    <Relationship Id="rId2" Type="${namespaces_styles}" Target="styles.xml"/>\n    <Relationship Id="rId3" Type="${namespaces_settingsRelation}" Target="settings.xml"/>\n    <Relationship Id="rId4" Type="${namespaces_webSettingsRelation}" Target="webSettings.xml"/>\n  </Relationships>\n`,
    relsXML = `\n    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n        <Relationship Id="rId1" Type="${namespaces_officeDocumentRelation}" Target="word/document.xml"/>\n        <Relationship Id="rId2" Type="${namespaces_corePropertiesRelation}" Target="docProps/core.xml"/>\n    </Relationships>\n`,
    fontTableXML = `\n    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n    <w:fonts\n      xmlns:r="${namespaces_r}"\n      xmlns:w="${namespaces_w}"\n      >\n        <w:font w:name="Calibri">\n            <w:panose1 w:val="020F0502020204030204"/>\n            <w:charset w:val="00"/>\n            <w:family w:val="swiss"/>\n            <w:pitch w:val="variable"/>\n            <w:sig w:usb0="E4002EFF" w:usb1="C000247B" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>\n        </w:font>\n        <w:font w:name="Times New Roman">\n            <w:panose1 w:val="02020603050405020304"/>\n            <w:charset w:val="00"/>\n            <w:family w:val="roman"/>\n            <w:pitch w:val="variable"/>\n            <w:sig w:usb0="E0002EFF" w:usb1="C000785B" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>\n        </w:font>\n        <w:font w:name="Calibri Light">\n            <w:panose1 w:val="020F0302020204030204"/>\n            <w:charset w:val="00"/>\n            <w:family w:val="swiss"/>\n            <w:pitch w:val="variable"/>\n            <w:sig w:usb0="E4002EFF" w:usb1="C000247B" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>\n        </w:font>\n    </w:fonts>\n`,
    settingsXML = `\n    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n    <w:settings xmlns:w="${namespaces_w}" xmlns:o="${namespaces_o}" xmlns:r="${namespaces_r}" xmlns:v="${namespaces_v}" xmlns:w10="${namespaces_w10}" xmlns:sl="${namespaces_sl}">\n        <w:zoom w:percent="100"/>\n        <w:defaultTabStop w:val="720"/>\n        <w:decimalSymbol w:val="."/>\n        <w:listSeparator w:val=","/>\n    </w:settings>\n`,
    webSettingsXML = `\n    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n    <w:webSettings xmlns:w="${namespaces_w}" xmlns:r="${namespaces_r}">\n    </w:webSettings>\n`;
var seed = 1;
var alphabet, previousSeed, shuffled, randomFromSeed = {
    nextValue: function () {
        return (seed = (9301 * seed + 49297) % 233280) / 233280
    }, seed: function (_seed_) {
        seed = _seed_
    }
}, ORIGINAL = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

function reset() {
    shuffled = !1
}

function setCharacters(_alphabet_) {
    if (_alphabet_) {
        if (_alphabet_ !== alphabet) {
            if (_alphabet_.length !== ORIGINAL.length) throw new Error("Custom alphabet for shortid must be " + ORIGINAL.length + " unique characters. You submitted " + _alphabet_.length + " characters: " + _alphabet_);
            var unique = _alphabet_.split("").filter((function (item, ind, arr) {
                return ind !== arr.lastIndexOf(item)
            }));
            if (unique.length) throw new Error("Custom alphabet for shortid must be " + ORIGINAL.length + " unique characters. These characters were not unique: " + unique.join(", "));
            alphabet = _alphabet_, reset()
        }
    } else alphabet !== ORIGINAL && (alphabet = ORIGINAL, reset())
}

function getShuffled() {
    return shuffled || (shuffled = function () {
        alphabet || setCharacters(ORIGINAL);
        for (var characterIndex, sourceArray = alphabet.split(""), targetArray = [], r = randomFromSeed.nextValue(); sourceArray.length > 0;) r = randomFromSeed.nextValue(), characterIndex = Math.floor(r * sourceArray.length), targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
        return targetArray.join("")
    }())
}

var alphabet_1 = {
        get: function () {
            return alphabet || ORIGINAL
        }, characters: function (_alphabet_) {
            return setCharacters(_alphabet_), alphabet
        }, seed: function (seed) {
            randomFromSeed.seed(seed), previousSeed !== seed && (reset(), previousSeed = seed)
        }, lookup: function (index) {
            return getShuffled()[index]
        }, shuffled: getShuffled
    }, crypto = "object" == typeof window && (window.crypto || window.msCrypto),
    randomByteBrowser = crypto && crypto.getRandomValues ? function (size) {
        return crypto.getRandomValues(new Uint8Array(size))
    } : function (size) {
        for (var bytes = [], i = 0; i < size; i++) bytes.push(Math.floor(256 * Math.random()));
        return bytes
    }, format_browser = function (random, alphabet, size) {
        for (var mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1, step = -~(1.6 * mask * size / alphabet.length), id = ""; ;) for (var bytes = random(step), i = step; i--;) if ((id += alphabet[bytes[i] & mask] || "").length === +size) return id
    };
var counter, previousSeconds, generate_1 = function (number) {
    for (var done, loopCounter = 0, str = ""; !done;) str += format_browser(randomByteBrowser, alphabet_1.get(), 1), done = number < Math.pow(16, loopCounter + 1), loopCounter++;
    return str
};
var build_1 = function (clusterWorkerId) {
    var str = "", seconds = Math.floor(.001 * (Date.now() - 1567752802062));
    return seconds === previousSeconds ? counter++ : (counter = 0, previousSeconds = seconds), str += generate_1(7), str += generate_1(clusterWorkerId), counter > 0 && (str += generate_1(counter)), str += generate_1(seconds)
};
var isValid = function (id) {
    return !(!id || "string" != typeof id || id.length < 6) && !new RegExp("[^" + alphabet_1.get().replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&") + "]").test(id)
}, lib = createCommonjsModule((function (module) {
    var clusterWorkerId = 0;

    function generate() {
        return build_1(clusterWorkerId)
    }

    module.exports = generate, module.exports.generate = generate, module.exports.seed = function (seedValue) {
        return alphabet_1.seed(seedValue), module.exports
    }, module.exports.worker = function (workerId) {
        return clusterWorkerId = workerId, module.exports
    }, module.exports.characters = function (newCharacters) {
        return void 0 !== newCharacters && alphabet_1.characters(newCharacters), alphabet_1.shuffled()
    }, module.exports.isValid = isValid
})), shortid = (lib.generate, lib.seed, lib.worker, lib.characters, lib.isValid, lib);
const landscapeMargins = {top: 1800, right: 1440, bottom: 1800, left: 1440, header: 720, footer: 720, gutter: 0},
    portraitMargins = {top: 1440, right: 1800, bottom: 1440, left: 1800, header: 720, footer: 720, gutter: 0};

class DocxDocument {
    constructor({
                    zip: zip,
                    htmlString: htmlString,
                    orientation: orientation,
                    margins: margins,
                    title: title,
                    subject: subject,
                    creator: creator,
                    keywords: keywords,
                    description: description,
                    lastModifiedBy: lastModifiedBy,
                    revision: revision,
                    createdAt: createdAt,
                    modifiedAt: modifiedAt,
                    headerType: headerType,
                    header: header,
                    footerType: footerType,
                    footer: footer,
                    font: font,
                    fontSize: fontSize,
                    complexScriptFontSize: complexScriptFontSize,
                    table: table,
                    pageNumber: pageNumber,
                    skipFirstHeaderFooter: skipFirstHeaderFooter,
                    lineNumber: lineNumber,
                    lineNumberOptions: lineNumberOptions
                }) {
        this.zip = zip, this.htmlString = htmlString, this.orientation = orientation, this.width = "landscape" === orientation ? 15840 : 12240, this.height = "landscape" === orientation ? 12240 : 15840, this.margins = margins && Object.keys(margins).length ? margins : "landscape" === orientation ? landscapeMargins : portraitMargins, this.availableDocumentSpace = this.width - this.margins.left - this.margins.right, this.title = title || "", this.subject = subject || "", this.creator = creator || "html-to-docx", this.keywords = keywords || ["html-to-docx"], this.description = description || "", this.lastModifiedBy = lastModifiedBy || "html-to-docx", this.revision = revision || 1, this.createdAt = createdAt || new Date, this.modifiedAt = modifiedAt || new Date, this.headerType = headerType || "default", this.header = header || !1, this.footerType = footerType || "default", this.footer = footer || !1, this.font = font || "Times New Roman", this.fontSize = fontSize || 22, this.complexScriptFontSize = complexScriptFontSize || 22, this.tableRowCantSplit = table && table.row && table.row.cantSplit || !1, this.pageNumber = pageNumber || !1, this.skipFirstHeaderFooter = skipFirstHeaderFooter || !1, this.lineNumber = lineNumber ? lineNumberOptions : null, this.lastNumberingId = 0, this.lastMediaId = 0, this.lastHeaderId = 0, this.lastFooterId = 0, this.stylesObjects = [], this.numberingObjects = [], this.relationshipFilename = "document", this.relationships = [{
            fileName: "document",
            lastRelsId: 4,
            rels: []
        }], this.mediaFiles = [], this.headerObjects = [], this.footerObjects = [], this.documentXML = null, this.generateContentTypesXML = this.generateContentTypesXML.bind(this), this.generateCoreXML = this.generateCoreXML.bind(this), this.generateDocumentXML = this.generateDocumentXML.bind(this), this.generateSettingsXML = this.generateSettingsXML.bind(this), this.generateWebSettingsXML = this.generateWebSettingsXML.bind(this), this.generateStylesXML = this.generateStylesXML.bind(this), this.generateFontTableXML = this.generateFontTableXML.bind(this), this.generateThemeXML = this.generateThemeXML.bind(this), this.generateNumberingXML = this.generateNumberingXML.bind(this), this.generateRelsXML = this.generateRelsXML.bind(this), this.createMediaFile = this.createMediaFile.bind(this), this.createDocumentRelationships = this.createDocumentRelationships.bind(this), this.generateHeaderXML = this.generateHeaderXML.bind(this), this.generateFooterXML = this.generateFooterXML.bind(this)
    }

    generateContentTypesXML() {
        const contentTypesXML$1 = create({
            encoding: "UTF-8",
            standalone: !0
        }, '\n    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />\n        <Default Extension="jpeg" ContentType="image/jpeg"/>\n        <Default Extension="png" ContentType="image/png"/>\n        <Default Extension="xml" ContentType="application/xml"/>\n        <Override PartName="/_rels/.rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n        <Override PartName="/word/_rels/document.xml.rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n        <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>\n        <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>\n        <Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>\n        <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>\n        <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n        <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>\n        <Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/>\n    </Types>\n');
        return this.headerObjects && Array.isArray(this.headerObjects) && this.headerObjects.length && this.headerObjects.forEach(({headerId: headerId}) => {
            const contentTypesFragment = fragment({defaultNamespace: {ele: "http://schemas.openxmlformats.org/package/2006/content-types"}}).ele("Override").att("PartName", `/word/header${headerId}.xml`).att("ContentType", "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml").up();
            contentTypesXML$1.root().import(contentTypesFragment)
        }), this.footerObjects && Array.isArray(this.footerObjects) && this.footerObjects.length && this.footerObjects.forEach(({footerId: footerId}) => {
            const contentTypesFragment = fragment({defaultNamespace: {ele: "http://schemas.openxmlformats.org/package/2006/content-types"}}).ele("Override").att("PartName", `/word/footer${footerId}.xml`).att("ContentType", "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml").up();
            contentTypesXML$1.root().import(contentTypesFragment)
        }), contentTypesXML$1.toString({prettyPrint: !0})
    }

    generateCoreXML() {
        return create({
            encoding: "UTF-8",
            standalone: !0
        }, ((title = "", subject = "", creator = "html-to-docx", keywords = ["html-to-docx"], description = "", lastModifiedBy = "html-to-docx", revision = 1, createdAt = new Date, modifiedAt = new Date) => `\n        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n        <cp:coreProperties\n          xmlns:cp="${namespaces_coreProperties}"\n          xmlns:dc="${namespaces_dc}"\n          xmlns:dcterms="${namespaces_dcterms}"\n          xmlns:dcmitype="${namespaces_dcmitype}"\n          xmlns:xsi="${namespaces_xsi}"\n          >\n            <dc:title>${title}</dc:title>\n            <dc:subject>${subject}</dc:subject>\n            <dc:creator>${creator}</dc:creator>\n            ${keywords && Array.isArray(keywords) ? `<cp:keywords>${keywords.join(", ")}</cp:keywords>` : ""}\n            <dc:description>${description}</dc:description>\n            <cp:lastModifiedBy>${lastModifiedBy}</cp:lastModifiedBy>\n            <cp:revision>${revision}</cp:revision>\n            <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt instanceof Date ? createdAt.toISOString() : (new Date).toISOString()}</dcterms:created>\n            <dcterms:modified xsi:type="dcterms:W3CDTF">${modifiedAt instanceof Date ? modifiedAt.toISOString() : (new Date).toISOString()}</dcterms:modified>\n        </cp:coreProperties>\n    `)(this.title, this.subject, this.creator, this.keywords, this.description, this.lastModifiedBy, this.revision, this.createdAt, this.modifiedAt)).toString({prettyPrint: !0})
    }

    generateDocumentXML() {
        const documentXML = create({
            encoding: "UTF-8",
            standalone: !0
        }, (width = this.width, height = this.height, orientation = this.orientation, margins = this.margins, `\n  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n    <w:document\n        xmlns:a="${namespaces_a}"\n        xmlns:cdr="${namespaces_cdr}"\n        xmlns:o="${namespaces_o}"\n        xmlns:pic="${namespaces_pic}"\n        xmlns:r="${namespaces_r}"\n        xmlns:v="${namespaces_v}"\n        xmlns:ve="${namespaces_ve}"\n        xmlns:vt="${namespaces_vt}"\n        xmlns:w="${namespaces_w}"\n        xmlns:w10="${namespaces_w10}"\n        xmlns:wp="${namespaces_wp}"\n        xmlns:wne="${namespaces_wne}"\n        >\n        <w:body>\n            <w:sectPr>\n                <w:pgSz w:w="${width}" w:h="${height}" w:orient="${orientation}" />\n                <w:pgMar w:top="${margins.top}"\n                        w:right="${margins.right}"\n                        w:bottom="${margins.bottom}"\n                        w:left="${margins.left}"\n                        w:header="${margins.header}"\n                        w:footer="${margins.footer}"\n                        w:gutter="${margins.gutter}"/>\n            </w:sectPr>\n        </w:body>\n    </w:document>\n  `));
        var width, height, orientation, margins;
        if (documentXML.root().first().import(this.documentXML), this.header && this.headerObjects && Array.isArray(this.headerObjects) && this.headerObjects.length) {
            const headerXmlFragment = fragment();
            this.headerObjects.forEach(({relationshipId: relationshipId, type: type}) => {
                const headerFragment = fragment({
                    namespaceAlias: {
                        w: namespaces_w,
                        r: namespaces_r
                    }
                }).ele("@w", "headerReference").att("@r", "id", "rId" + relationshipId).att("@w", "type", type).up();
                headerXmlFragment.import(headerFragment)
            }), documentXML.root().first().first().import(headerXmlFragment)
        }
        if (this.footer && this.footerObjects && Array.isArray(this.footerObjects) && this.footerObjects.length) {
            const footerXmlFragment = fragment();
            this.footerObjects.forEach(({relationshipId: relationshipId, type: type}) => {
                const footerFragment = fragment({
                    namespaceAlias: {
                        w: namespaces_w,
                        r: namespaces_r
                    }
                }).ele("@w", "footerReference").att("@r", "id", "rId" + relationshipId).att("@w", "type", type).up();
                footerXmlFragment.import(footerFragment)
            }), documentXML.root().first().first().import(footerXmlFragment)
        }
        if ((this.header || this.footer) && this.skipFirstHeaderFooter) {
            const titlePageFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "titlePg");
            documentXML.root().first().first().import(titlePageFragment)
        }
        if (this.lineNumber) {
            const {countBy: countBy, start: start, restart: restart} = this.lineNumber,
                lineNumberFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "lnNumType").att("@w", "countBy", countBy).att("@w", "start", start).att("@w", "restart", restart);
            documentXML.root().first().first().import(lineNumberFragment)
        }
        return documentXML.toString({prettyPrint: !0})
    }

    generateSettingsXML() {
        return create({encoding: "UTF-8", standalone: !0}, settingsXML).toString({prettyPrint: !0})
    }

    generateWebSettingsXML() {
        return create({encoding: "UTF-8", standalone: !0}, webSettingsXML).toString({prettyPrint: !0})
    }

    generateStylesXML() {
        return create({
            encoding: "UTF-8",
            standalone: !0
        }, ((font = "Times New Roman", fontSize = 22, complexScriptFontSize = 22) => `\n  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n  <w:styles xmlns:w="${namespaces_w}" xmlns:r="${namespaces_r}">\n\t<w:docDefaults>\n\t  <w:rPrDefault>\n\t\t<w:rPr>\n\t\t  <w:rFonts w:ascii="${font}" w:eastAsiaTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi" />\n\t\t  <w:sz w:val="${fontSize}" />\n\t\t  <w:szCs w:val="${complexScriptFontSize}" />\n\t\t  <w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-SA" />\n\t\t</w:rPr>\n\t  </w:rPrDefault>\n\t  <w:pPrDefault>\n\t\t<w:pPr>\n\t\t  <w:spacing w:after="120" w:line="240" w:lineRule="atLeast" />\n\t\t</w:pPr>\n\t  </w:pPrDefault>\n\t</w:docDefaults>\n\t<w:style w:type="character" w:styleId="Hyperlink">\n\t  <w:name w:val="Hyperlink" />\n\t  <w:rPr>\n\t\t<w:color w:val="0000FF" />\n\t\t<w:u w:val="single" />\n\t  </w:rPr>\n\t</w:style>\n\t<w:style w:type="paragraph" w:styleId="Heading1">\n\t  <w:name w:val="heading 1" />\n\t  <w:basedOn w:val="Normal" />\n\t  <w:next w:val="Normal" />\n\t  <w:uiPriority w:val="9" />\n\t  <w:qFormat />\n\t  <w:pPr>\n\t\t<w:keepNext />\n\t\t<w:keepLines />\n\t\t<w:spacing w:before="480" />\n\t\t<w:outlineLvl w:val="0" />\n\t  </w:pPr>\n\t  <w:rPr>\n\t\t<w:b />\n\t\t<w:sz w:val="48" />\n\t\t<w:szCs w:val="48" />\n\t  </w:rPr>\n\t</w:style>\n\t<w:style w:type="paragraph" w:styleId="Heading2">\n\t  <w:name w:val="heading 2" />\n\t  <w:basedOn w:val="Normal" />\n\t  <w:next w:val="Normal" />\n\t  <w:uiPriority w:val="9" />\n\t  <w:unhideWhenUsed />\n\t  <w:qFormat />\n\t  <w:pPr>\n\t\t<w:keepNext />\n\t\t<w:keepLines />\n\t\t<w:spacing w:before="360" w:after="80" />\n\t\t<w:outlineLvl w:val="1" />\n\t  </w:pPr>\n\t  <w:rPr>\n\t\t<w:b />\n\t\t<w:sz w:val="36" />\n\t\t<w:szCs w:val="36" />\n\t  </w:rPr>\n\t</w:style>\n\t<w:style w:type="paragraph" w:styleId="Heading3">\n\t  <w:name w:val="heading 3" />\n\t  <w:basedOn w:val="Normal" />\n\t  <w:next w:val="Normal" />\n\t  <w:uiPriority w:val="9" />\n\t  <w:semiHidden />\n\t  <w:unhideWhenUsed />\n\t  <w:qFormat />\n\t  <w:pPr>\n\t\t<w:keepNext />\n\t\t<w:keepLines />\n\t\t<w:spacing w:before="280" w:after="80" />\n\t\t<w:outlineLvl w:val="2" />\n\t  </w:pPr>\n\t  <w:rPr>\n\t\t<w:b />\n\t\t<w:sz w:val="28" />\n\t\t<w:szCs w:val="28" />\n\t  </w:rPr>\n\t</w:style>\n\t<w:style w:type="paragraph" w:styleId="Heading4">\n\t  <w:name w:val="heading 4" />\n\t  <w:basedOn w:val="Normal" />\n\t  <w:next w:val="Normal" />\n\t  <w:uiPriority w:val="9" />\n\t  <w:semiHidden />\n\t  <w:unhideWhenUsed />\n\t  <w:qFormat />\n\t  <w:pPr>\n\t\t<w:keepNext />\n\t\t<w:keepLines />\n\t\t<w:spacing w:before="240" w:after="40" />\n\t\t<w:outlineLvl w:val="3" />\n\t  </w:pPr>\n\t  <w:rPr>\n\t\t<w:b />\n\t\t<w:sz w:val="24" />\n\t\t<w:szCs w:val="24" />\n\t  </w:rPr>\n\t</w:style>\n\t<w:style w:type="paragraph" w:styleId="Heading5">\n\t  <w:name w:val="heading 5" />\n\t  <w:basedOn w:val="Normal" />\n\t  <w:next w:val="Normal" />\n\t  <w:uiPriority w:val="9" />\n\t  <w:semiHidden />\n\t  <w:unhideWhenUsed />\n\t  <w:qFormat />\n\t  <w:pPr>\n\t\t<w:keepNext />\n\t\t<w:keepLines />\n\t\t<w:spacing w:before="220" w:after="40" />\n\t\t<w:outlineLvl w:val="4" />\n\t  </w:pPr>\n\t  <w:rPr>\n\t\t<w:b />\n\t  </w:rPr>\n\t</w:style>\n\t<w:style w:type="paragraph" w:styleId="Heading6">\n\t  <w:name w:val="heading 6" />\n\t  <w:basedOn w:val="Normal" />\n\t  <w:next w:val="Normal" />\n\t  <w:uiPriority w:val="9" />\n\t  <w:semiHidden />\n\t  <w:unhideWhenUsed />\n\t  <w:qFormat />\n\t  <w:pPr>\n\t\t<w:keepNext />\n\t\t<w:keepLines />\n\t\t<w:spacing w:before="200" w:after="40" />\n\t\t<w:outlineLvl w:val="5" />\n\t  </w:pPr>\n\t  <w:rPr>\n\t\t<w:b />\n\t\t<w:sz w:val="20" />\n\t\t<w:szCs w:val="20" />\n\t  </w:rPr>\n\t</w:style>\n  </w:styles>\n  `)(this.font, this.fontSize, this.complexScriptFontSize)).toString({prettyPrint: !0})
    }

    generateFontTableXML() {
        return create({encoding: "UTF-8", standalone: !0}, fontTableXML).toString({prettyPrint: !0})
    }

    generateThemeXML() {
        return create({
            encoding: "UTF-8",
            standalone: !0
        }, ((font = "Times New Roman") => `\n    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n    <a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">\n    <a:themeElements>\n      <a:clrScheme name="Office">\n        <a:dk1>\n          <a:sysClr val="windowText" lastClr="000000"/>\n        </a:dk1>\n        <a:lt1>\n          <a:sysClr val="window" lastClr="FFFFFF"/>\n        </a:lt1>\n        <a:dk2>\n          <a:srgbClr val="44546A"/>\n        </a:dk2>\n        <a:lt2>\n          <a:srgbClr val="E7E6E6"/>\n        </a:lt2>\n        <a:accent1>\n          <a:srgbClr val="4472C4"/>\n        </a:accent1>\n        <a:accent2>\n          <a:srgbClr val="ED7D31"/>\n        </a:accent2>\n        <a:accent3>\n          <a:srgbClr val="A5A5A5"/>\n        </a:accent3>\n        <a:accent4>\n          <a:srgbClr val="FFC000"/>\n        </a:accent4>\n        <a:accent5>\n          <a:srgbClr val="5B9BD5"/>\n        </a:accent5>\n        <a:accent6>\n          <a:srgbClr val="70AD47"/>\n        </a:accent6>\n        <a:hlink>\n          <a:srgbClr val="0563C1"/>\n        </a:hlink>\n        <a:folHlink>\n          <a:srgbClr val="954F72"/>\n        </a:folHlink>\n      </a:clrScheme>\n      <a:fontScheme name="Office">\n        <a:majorFont>\n          <a:latin typeface="${font}"/>\n          <a:ea typeface="${font}"/>\n          <a:cs typeface=""/>\n        </a:majorFont>\n        <a:minorFont>\n          <a:latin typeface="${font}"/>\n          <a:ea typeface="${font}"/>\n          <a:cs typeface=""/>\n        </a:minorFont>\n      </a:fontScheme>\n      <a:fmtScheme name="Office">\n        <a:fillStyleLst>\n          <a:solidFill>\n            <a:schemeClr val="phClr"/>\n          </a:solidFill>\n          <a:gradFill rotWithShape="1">\n            <a:gsLst>\n              <a:gs pos="0">\n                <a:schemeClr val="phClr">\n                  <a:lumMod val="110000"/>\n                  <a:satMod val="105000"/>\n                  <a:tint val="67000"/>\n                </a:schemeClr>\n              </a:gs>\n              <a:gs pos="50000">\n                <a:schemeClr val="phClr">\n                  <a:lumMod val="105000"/>\n                  <a:satMod val="103000"/>\n                  <a:tint val="73000"/>\n                </a:schemeClr>\n              </a:gs>\n              <a:gs pos="100000">\n                <a:schemeClr val="phClr">\n                  <a:lumMod val="105000"/>\n                  <a:satMod val="109000"/>\n                  <a:tint val="81000"/>\n                </a:schemeClr>\n              </a:gs>\n            </a:gsLst>\n            <a:lin ang="5400000" scaled="0"/>\n          </a:gradFill>\n          <a:gradFill rotWithShape="1">\n            <a:gsLst>\n              <a:gs pos="0">\n                <a:schemeClr val="phClr">\n                  <a:satMod val="103000"/>\n                  <a:lumMod val="102000"/>\n                  <a:tint val="94000"/>\n                </a:schemeClr>\n              </a:gs>\n              <a:gs pos="50000">\n                <a:schemeClr val="phClr">\n                  <a:satMod val="110000"/>\n                  <a:lumMod val="100000"/>\n                  <a:shade val="100000"/>\n                </a:schemeClr>\n              </a:gs>\n              <a:gs pos="100000">\n                <a:schemeClr val="phClr">\n                  <a:lumMod val="99000"/>\n                  <a:satMod val="120000"/>\n                  <a:shade val="78000"/>\n                </a:schemeClr>\n              </a:gs>\n            </a:gsLst>\n            <a:lin ang="5400000" scaled="0"/>\n          </a:gradFill>\n        </a:fillStyleLst>\n        <a:lnStyleLst>\n          <a:ln w="6350" cap="flat" cmpd="sng" algn="ctr">\n            <a:solidFill>\n              <a:schemeClr val="phClr"/>\n            </a:solidFill>\n            <a:prstDash val="solid"/>\n            <a:miter lim="800000"/>\n          </a:ln>\n          <a:ln w="12700" cap="flat" cmpd="sng" algn="ctr">\n            <a:solidFill>\n              <a:schemeClr val="phClr"/>\n            </a:solidFill>\n            <a:prstDash val="solid"/>\n            <a:miter lim="800000"/>\n          </a:ln>\n          <a:ln w="19050" cap="flat" cmpd="sng" algn="ctr">\n            <a:solidFill>\n              <a:schemeClr val="phClr"/>\n            </a:solidFill>\n            <a:prstDash val="solid"/>\n            <a:miter lim="800000"/>\n          </a:ln>\n        </a:lnStyleLst>\n        <a:effectStyleLst>\n          <a:effectStyle>\n            <a:effectLst/>\n          </a:effectStyle>\n          <a:effectStyle>\n            <a:effectLst/>\n          </a:effectStyle>\n          <a:effectStyle>\n            <a:effectLst>\n              <a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0">\n                <a:srgbClr val="000000">\n                  <a:alpha val="63000"/>\n                </a:srgbClr>\n              </a:outerShdw>\n            </a:effectLst>\n          </a:effectStyle>\n        </a:effectStyleLst>\n        <a:bgFillStyleLst>\n          <a:solidFill>\n            <a:schemeClr val="phClr"/>\n          </a:solidFill>\n          <a:solidFill>\n            <a:schemeClr val="phClr">\n              <a:tint val="95000"/>\n              <a:satMod val="170000"/>\n            </a:schemeClr>\n          </a:solidFill>\n          <a:gradFill rotWithShape="1">\n            <a:gsLst>\n              <a:gs pos="0">\n                <a:schemeClr val="phClr">\n                  <a:tint val="93000"/>\n                  <a:satMod val="150000"/>\n                  <a:shade val="98000"/>\n                  <a:lumMod val="102000"/>\n                </a:schemeClr>\n              </a:gs>\n              <a:gs pos="50000">\n                <a:schemeClr val="phClr">\n                  <a:tint val="98000"/>\n                  <a:satMod val="130000"/>\n                  <a:shade val="90000"/>\n                  <a:lumMod val="103000"/>\n                </a:schemeClr>\n              </a:gs>\n              <a:gs pos="100000">\n                <a:schemeClr val="phClr">\n                  <a:shade val="63000"/>\n                  <a:satMod val="120000"/>\n                </a:schemeClr>\n              </a:gs>\n            </a:gsLst>\n            <a:lin ang="5400000" scaled="0"/>\n          </a:gradFill>\n        </a:bgFillStyleLst>\n      </a:fmtScheme>\n    </a:themeElements>\n  </a:theme>\n`)(this.font)).toString({prettyPrint: !0})
    }

    generateNumberingXML() {
        const numberingXML = create({
                encoding: "UTF-8",
                standalone: !0
            }, `\n        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n        <w:numbering\n        xmlns:w="${namespaces_w}"\n        xmlns:ve="${namespaces_ve}"\n        xmlns:o="${namespaces_o}"\n        xmlns:r="${namespaces_r}"\n        xmlns:v="${namespaces_v}"\n        xmlns:wp="${namespaces_wp}"\n        xmlns:w10="${namespaces_w10}"\n        xmlns:wne="${namespaces_wne}">\n        </w:numbering>\n    `),
            abstractNumberingFragments = fragment(), numberingFragments = fragment();
        return this.numberingObjects.forEach(({numberingId: numberingId, listElements: listElements}) => {
            const abstractNumberingFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "abstractNum").att("@w", "abstractNumId", String(numberingId)).ele("@w", "multiLevelType").att("@w", "val", "hybridMultilevel").up();
            listElements.filter((value, index, self) => self.findIndex(v => v.level === value.level) === index).forEach(({
                                                                                                                             level: level,
                                                                                                                             type: type
                                                                                                                         }) => {
                const levelFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "lvl").att("@w", "ilvl", level).ele("@w", "start").att("@w", "val", "1").up().ele("@w", "numFmt").att("@w", "val", "ol" === type ? "decimal" : "bullet").up().ele("@w", "lvlText").att("@w", "val", "ol" === type ? "%" + (level + 1) : "").up().ele("@w", "lvlJc").att("@w", "val", "left").up().ele("@w", "pPr").ele("@w", "tabs").ele("@w", "tab").att("@w", "val", "num").att("@w", "pos", 720 * (level + 1)).up().up().ele("@w", "ind").att("@w", "left", 720 * (level + 1)).att("@w", "hanging", 360).up().up().up();
                if ("ul" === type) {
                    const runPropertiesFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "rPr").ele("@w", "rFonts").att("@w", "ascii", "Wingdings").att("@w", "hAnsi", "Wingdings").att("@w", "hint", "default").up().up();
                    levelFragment.last().import(runPropertiesFragment)
                }
                abstractNumberingFragment.import(levelFragment)
            }), abstractNumberingFragment.up();
            const numberingFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "num").att("@w", "numId", String(numberingId)).ele("@w", "abstractNumId").att("@w", "val", String(numberingId)).up().up();
            abstractNumberingFragments.import(abstractNumberingFragment), numberingFragments.import(numberingFragment)
        }), numberingXML.root().import(abstractNumberingFragments), numberingXML.root().import(numberingFragments), numberingXML.toString({prettyPrint: !0})
    }

    appendRelationships(xmlFragment, relationships) {
        relationships.forEach(({
                                   relationshipId: relationshipId,
                                   type: type,
                                   target: target,
                                   targetMode: targetMode
                               }) => {
            const relationshipFragment = fragment({defaultNamespace: {ele: "http://schemas.openxmlformats.org/package/2006/relationships"}}).ele("Relationship").att("Id", "rId" + relationshipId).att("Type", type).att("Target", target).att("TargetMode", targetMode).up();
            xmlFragment.import(relationshipFragment)
        })
    }

    generateRelsXML() {
        return this.relationships.map(({fileName: fileName, rels: rels}) => {
            let xmlFragment;
            return xmlFragment = create({
                encoding: "UTF-8",
                standalone: !0
            }, "document" === fileName ? documentRelsXML : '\n    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n\n    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n    </Relationships>\n'), this.appendRelationships(xmlFragment.root(), rels), {
                fileName: fileName,
                xmlString: xmlFragment.toString({prettyPrint: !0})
            }
        })
    }

    createNumbering(listElements) {
        return this.lastNumberingId += 1, this.numberingObjects.push({
            numberingId: this.lastNumberingId,
            listElements: listElements
        }), this.lastNumberingId
    }

    createMediaFile(base64String) {
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (3 !== matches.length) throw new Error("Invalid base64 string");
        const base64FileContent = matches[2],
            fileExtension = "octet-stream" === matches[1].match(/\/(.*?)$/)[1] ? "png" : matches[1].match(/\/(.*?)$/)[1],
            fileNameWithExtension = `image-${shortid.generate()}.${fileExtension}`;
        return this.lastMediaId += 1, {
            id: this.lastMediaId,
            fileContent: base64FileContent,
            fileNameWithExtension: fileNameWithExtension
        }
    }

    createDocumentRelationships(fileName = "document", type, target, targetMode = "External") {
        let relationshipType,
            relationshipObject = this.relationships.find(relationship => relationship.fileName === fileName),
            lastRelsId = 1;
        switch (relationshipObject ? (lastRelsId = relationshipObject.lastRelsId + 1, relationshipObject.lastRelsId = lastRelsId) : (relationshipObject = {
            fileName: fileName,
            lastRelsId: lastRelsId,
            rels: []
        }, this.relationships.push(relationshipObject)), type) {
            case"hyperlink":
                relationshipType = namespaces_hyperlinks;
                break;
            case"image":
                relationshipType = namespaces_images;
                break;
            case"header":
                relationshipType = namespaces_headers;
                break;
            case"footer":
                relationshipType = namespaces_footers;
                break;
            case"theme":
                relationshipType = namespaces_themes
        }
        return relationshipObject.rels.push({
            relationshipId: lastRelsId,
            type: relationshipType,
            target: target,
            targetMode: targetMode
        }), lastRelsId
    }

    generateHeaderXML(vTree) {
        const headerXML = create({
            encoding: "UTF-8",
            standalone: !0,
            namespaceAlias: {
                w: namespaces_w,
                ve: namespaces_ve,
                o: namespaces_o,
                r: namespaces_r,
                v: namespaces_v,
                wp: namespaces_wp,
                w10: namespaces_w10
            }
        }).ele("@w", "hdr"), XMLFragment = fragment();
        return convertVTreeToXML(this, vTree, XMLFragment), headerXML.root().import(XMLFragment), this.lastHeaderId += 1, {
            headerId: this.lastHeaderId,
            headerXML: headerXML
        }
    }

    generateFooterXML(vTree) {
        const footerXML = create({
            encoding: "UTF-8",
            standalone: !0,
            namespaceAlias: {
                w: namespaces_w,
                ve: namespaces_ve,
                o: namespaces_o,
                r: namespaces_r,
                v: namespaces_v,
                wp: namespaces_wp,
                w10: namespaces_w10
            }
        }).ele("@w", "ftr"), XMLFragment = fragment();
        if (convertVTreeToXML(this, vTree, XMLFragment), "p" === XMLFragment.first().node.tagName && this.pageNumber) {
            const fieldSimpleFragment = fragment({namespaceAlias: {w: namespaces_w}}).ele("@w", "fldSimple").att("@w", "instr", "PAGE").ele("@w", "r").up().up();
            XMLFragment.first().import(fieldSimpleFragment)
        }
        return footerXML.root().import(XMLFragment), this.lastFooterId += 1, {
            footerId: this.lastFooterId,
            footerXML: footerXML
        }
    }
}

const convertHTML$1 = HTMLToVDOM_({VNode: vnode, VText: vtext}), defaultDocumentOptions = {
    orientation: "portrait",
    margins: {top: 1440, right: 1800, bottom: 1440, left: 1800, header: 720, footer: 720, gutter: 0},
    title: "",
    subject: "",
    creator: "html-to-docx",
    keywords: ["html-to-docx"],
    description: "",
    lastModifiedBy: "html-to-docx",
    revision: 1,
    createdAt: new Date,
    modifiedAt: new Date,
    headerType: "default",
    header: !1,
    footerType: "default",
    footer: !1,
    font: "Times New Roman",
    fontSize: 22,
    complexScriptFontSize: 22,
    table: {row: {cantSplit: !1}},
    pageNumber: !1,
    skipFirstHeaderFooter: !1,
    lineNumber: !1,
    lineNumberOptions: {countBy: 1, start: 0, restart: "continuous"}
}, fixupMargins = margins => {
    let normalizedMargins = {};
    return "object" == typeof margins && null !== margins ? Object.keys(margins).forEach(key => {
        if (pixelRegex.test(margins[key])) {
            const matchedParts = margins[key].match(pixelRegex);
            normalizedMargins[key] = pixelToTWIP(matchedParts[1])
        } else if (cmRegex.test(margins[key])) {
            const matchedParts = margins[key].match(cmRegex);
            normalizedMargins[key] = (cmValue = matchedParts[1], inchToTWIP((cmValue => .3937008 * cmValue)(cmValue)))
        } else if (inchRegex.test(margins[key])) {
            const matchedParts = margins[key].match(inchRegex);
            normalizedMargins[key] = inchToTWIP(matchedParts[1])
        } else margins[key] ? normalizedMargins[key] = margins[key] : normalizedMargins[key] = defaultDocumentOptions.margins[key];
        var cmValue
    }) : normalizedMargins = null, normalizedMargins
}, normalizeDocumentOptions = documentOptions => {
    const normalizedDocumentOptions = {...documentOptions};
    return Object.keys(documentOptions).forEach(key => {
        switch (key) {
            case"margins":
                normalizedDocumentOptions.margins = fixupMargins(documentOptions[key]);
                break;
            case"fontSize":
            case"complexScriptFontSize":
                normalizedDocumentOptions[key] = (fontSize => {
                    let normalizedFontSize;
                    if (pointRegex.test(fontSize)) {
                        const matchedParts = fontSize.match(pointRegex);
                        normalizedFontSize = pointToHIP(matchedParts[1])
                    } else normalizedFontSize = fontSize || null;
                    return normalizedFontSize
                })(documentOptions[key])
        }
    }), normalizedDocumentOptions
};

function addFilesToContainer(zip, htmlString, suppliedDocumentOptions, headerHTMLString, footerHTMLString) {
    const normalizedDocumentOptions = normalizeDocumentOptions(suppliedDocumentOptions),
        documentOptions = (options = defaultDocumentOptions, patch = normalizedDocumentOptions, {...options, ...patch});
    var options, patch;
    documentOptions.header && !headerHTMLString && (headerHTMLString = "<p></p>"), documentOptions.footer && !footerHTMLString && (footerHTMLString = "<p></p>");
    const docxDocument = new DocxDocument({zip: zip, htmlString: htmlString, ...documentOptions});
    var docxDocumentInstance;
    if (docxDocument.documentXML = convertVTreeToXML(docxDocumentInstance = docxDocument, convertHTML(docxDocumentInstance.htmlString), fragment({namespaceAlias: {w: namespaces_w}})), zip.folder("_rels").file(".rels", create({
        encoding: "UTF-8",
        standalone: !0
    }, relsXML).toString({prettyPrint: !0}), {createFolders: !1}), zip.folder("docProps").file("core.xml", docxDocument.generateCoreXML(), {createFolders: !1}), docxDocument.header && headerHTMLString) {
        const vTree = convertHTML$1(headerHTMLString);
        docxDocument.relationshipFilename = "header1";
        const {headerId: headerId, headerXML: headerXML} = docxDocument.generateHeaderXML(vTree);
        docxDocument.relationshipFilename = "document";
        const relationshipId = docxDocument.createDocumentRelationships(docxDocument.relationshipFilename, "header", `header${headerId}.xml`, "Internal");
        zip.folder("word").file(`header${headerId}.xml`, headerXML.toString({prettyPrint: !0}), {createFolders: !1}), docxDocument.headerObjects.push({
            headerId: headerId,
            relationshipId: relationshipId,
            type: docxDocument.headerType
        })
    }
    if (docxDocument.footer && footerHTMLString) {
        const vTree = convertHTML$1(footerHTMLString);
        docxDocument.relationshipFilename = "footer1";
        const {footerId: footerId, footerXML: footerXML} = docxDocument.generateFooterXML(vTree);
        docxDocument.relationshipFilename = "document";
        const relationshipId = docxDocument.createDocumentRelationships(docxDocument.relationshipFilename, "footer", `footer${footerId}.xml`, "Internal");
        zip.folder("word").file(`footer${footerId}.xml`, footerXML.toString({prettyPrint: !0}), {createFolders: !1}), docxDocument.footerObjects.push({
            footerId: footerId,
            relationshipId: relationshipId,
            type: docxDocument.footerType
        })
    }
    docxDocument.createDocumentRelationships(docxDocument.relationshipFilename, "theme", "theme/theme1.xml", "Internal"), zip.folder("word").folder("theme").file("theme1.xml", docxDocument.generateThemeXML(), {createFolders: !1}), zip.folder("word").file("document.xml", docxDocument.generateDocumentXML(), {createFolders: !1}).file("fontTable.xml", docxDocument.generateFontTableXML(), {createFolders: !1}).file("styles.xml", docxDocument.generateStylesXML(), {createFolders: !1}).file("numbering.xml", docxDocument.generateNumberingXML(), {createFolders: !1}).file("settings.xml", docxDocument.generateSettingsXML(), {createFolders: !1}).file("webSettings.xml", docxDocument.generateWebSettingsXML(), {createFolders: !1});
    const relationshipXMLs = docxDocument.generateRelsXML();
    return relationshipXMLs && Array.isArray(relationshipXMLs) && relationshipXMLs.forEach(({
                                                                                                fileName: fileName,
                                                                                                xmlString: xmlString
                                                                                            }) => {
        zip.folder("word").folder("_rels").file(fileName + ".xml.rels", xmlString, {createFolders: !1})
    }), zip.file("[Content_Types].xml", docxDocument.generateContentTypesXML(), {createFolders: !1}), zip
}

const minifyHTMLString = htmlString => {
    if (!("string" == typeof htmlString || htmlString instanceof String)) return null;
    try {
        return htmlString.replace(/\n/g, " ").replace(/\r/g, " ").replace(/\r\n/g, " ").replace(/[\t]+\</g, "<").replace(/\>[\t ]+\</g, "><").replace(/\>[\t ]+$/g, ">")
    } catch (error) {
        return null
    }
};
export default async function (htmlString, headerHTMLString, documentOptions = {}, footerHTMLString) {
    const zip = new JSZip;
    let contentHTML = htmlString, headerHTML = headerHTMLString, footerHTML = footerHTMLString;
    htmlString && (contentHTML = minifyHTMLString(contentHTML)), headerHTMLString && (headerHTML = minifyHTMLString(headerHTML)), footerHTMLString && (footerHTML = minifyHTMLString(footerHTML)), addFilesToContainer(zip, contentHTML, documentOptions, headerHTML, footerHTML);
    const buffer = await zip.generateAsync({type: "arraybuffer"});
    if (Object.prototype.hasOwnProperty.call(global, "Blob")) return new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
    if (Object.prototype.hasOwnProperty.call(global, "Buffer")) return Buffer.from(new Uint8Array(buffer));
    throw new Error("Add blob support using a polyfill eg https://github.com/bjornstar/blob-polyfill")
}
//# sourceMappingURL=html-to-docx.esm.js.map
