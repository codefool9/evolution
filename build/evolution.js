(function(exports, global) {
    global["evolution"] = exports;
    var $$ = exports.$$ || function(name) {
        if (!$$[name]) {
            $$[name] = {};
        }
        return $$[name];
    };
    var cache = $$("c");
    var internals = $$("i");
    var pending = $$("p");
    exports.$$ = $$;
    var toArray = function(args) {
        return Array.prototype.slice.call(args);
    };
    var _ = function(name) {
        var args = toArray(arguments);
        var val = args[1];
        if (typeof val === "function") {
            this.c[name] = val();
        } else {
            cache[name] = args[2];
            cache[name].$inject = val;
            cache[name].$internal = this.i;
        }
    };
    var define = function() {
        _.apply({
            i: false,
            c: exports
        }, toArray(arguments));
    };
    var internal = function() {
        _.apply({
            i: true,
            c: internals
        }, toArray(arguments));
    };
    var resolve = function(name, fn) {
        pending[name] = true;
        var injections = fn.$inject;
        var args = [];
        var injectionName;
        for (var i in injections) {
            if (injections.hasOwnProperty(i)) {
                injectionName = injections[i];
                if (cache[injectionName]) {
                    if (pending.hasOwnProperty(injectionName)) {
                        throw new Error('Cyclical reference: "' + name + '" referencing "' + injectionName + '"');
                    }
                    resolve(injectionName, cache[injectionName]);
                    delete cache[injectionName];
                }
            }
        }
        if (!exports[name] && !internals[name]) {
            for (var n in injections) {
                injectionName = injections[n];
                args.push(exports.hasOwnProperty(injectionName) && exports[injectionName] || internals.hasOwnProperty(injectionName) && internals[injectionName]);
            }
            if (fn.$internal) {
                internals[name] = fn.apply(null, args) || name;
            } else {
                exports[name] = fn.apply(null, args) || name;
            }
        }
        Object.defineProperty(exports, "$$", {
            enumerable: false,
            writable: false
        });
        delete pending[name];
    };
    //! src/collision.js
    internal("collision", [ "getDistance" ], function(getDistance) {
        function collision(cell, cells) {
            var c;
            var dist;
            for (var i = 0; i < cells.length; i += 1) {
                c = cells[i];
                dist = getDistance(cell.x, cell.y, c.x, c.y);
                if (cell !== c && dist < cell.radius + c.radius) {
                    return c;
                }
            }
        }
        return collision;
    });
    //! src/main.js
    internal("main", [ "cell", "mouseControl", "AIControl", "collision" ], function(cell, mouseControl, AIControl, collision) {
        window.hb = exports;
        var canvas = document.querySelector(".evolution");
        var width = 600;
        var height = 600;
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        var level = 1;
        var AIPlayers = [];
        var shapes = [];
        var i;
        var defaultSize = 7.5;
        var player;
        function randomX() {
            return Math.random() * width;
        }
        function randomY() {
            return Math.random() * height;
        }
        function createAIControls(max) {
            for (i = 0; i < max; i += 1) {
                var c2 = cell.create(context, Math.random() * width, Math.random() * height, 10, 2, "red");
                c2.type = "ai";
                shapes.push(c2);
                AIPlayers.push(c2);
                AIControl(canvas, c2);
            }
        }
        function createPellets(numOfPellets) {
            for (i = 0; i < numOfPellets; i += 1) {
                var p1 = cell.create(context, randomX(), randomY(), Math.random() * 2 + 2);
                p1.type = "pellet";
                shapes.push(p1);
            }
        }
        function render() {
            context.clearRect(0, 0, 600, 600);
            var i;
            var c;
            var collide;
            var index;
            for (i = 0; i < shapes.length; i += 1) {
                c = shapes[i];
                c.update();
            }
            for (i = 0; i < shapes.length; i += 1) {
                c = shapes[i];
                if (c.speed) {
                    c.speed = width / (c.radius * .5) / 30;
                    collide = collision(c, shapes);
                    if (collide && collide.radius < c.radius) {
                        c.eat(collide);
                        if (collide.type === "ai") {
                            index = AIPlayers.indexOf(collide);
                        } else if (collide === player) {
                            console.log("game over");
                        } else if (collide.type === "pellet") {
                            createPellets(1);
                        }
                        shapes.splice(shapes.indexOf(collide), 1);
                    }
                }
                c.draw();
            }
        }
        function findPlayer(playerId) {
            var id;
            for (var i = 0; i < shapes.length; i += 1) {
                id = shapes[i].id;
                if (id && playerId === id.toString()) {
                    return shapes[i];
                }
            }
        }
        player = cell.create(context, 250, 250, defaultSize, 2, "blue");
        player.id = Date.now();
        player.name = prompt("Please enter your name");
        shapes.push(player);
        mouseControl(canvas, player);
        setInterval(render, 20);
        createPellets(100);
        function connect() {
            var p2p = new P2P("g5ezqak33ze3766r", "evolution", player);
            function update() {
                if (shapes.indexOf(player) === -1) {
                    return;
                }
                p2p.send({
                    player: {
                        id: player.id.toString(),
                        x: player.x,
                        y: player.y,
                        radius: player.radius,
                        color: player.color
                    }
                });
                p2p.onMessage(function(message) {
                    var plr;
                    if (!(plr = findPlayer(message.player.id))) {
                        plr = cell.create(context, message.player.x, message.player.y, defaultSize, 2, message.player.color);
                        plr.id = message.player.id;
                        shapes.push(plr);
                    }
                    plr.x = message.player.x;
                    plr.y = message.player.y;
                    plr.radius = message.player.radius;
                });
                setTimeout(update, 20);
            }
            p2p.connect(update);
        }
        connect();
    });
    //! node_modules/hbjs/src/utils/geom/getAngle.js
    define("getAngle", function() {
        return function getAngle(x1, y1, x2, y2) {
            return Math.atan2(y2 - y1, x2 - x1);
        };
    });
    //! node_modules/hbjs/src/utils/geom/getPointOnCircle.js
    define("getPointOnCircle", function() {
        return function getPointOnCircle(cx, cy, r, a) {
            return {
                x: cx + r * Math.cos(a),
                y: cy + r * Math.sin(a)
            };
        };
    });
    //! src/mouseControl.js
    internal("mouseControl", [], function() {
        function MouseControl(target, cell) {
            var self = this;
            self.x = 0;
            self.y = 0;
            function onMouseMove(evt) {
                self.x = evt.offsetX;
                self.y = evt.offsetY;
                cell.setTargetPoint(self);
            }
            target.addEventListener("mousemove", onMouseMove);
        }
        return function createMouseControl(target, cell) {
            return new MouseControl(target, cell);
        };
    });
    //! src/AIControl.js
    internal("AIControl", [ "getDistance" ], function(getDistance) {
        function AIControl(target, cell) {
            var self = this;
            self.x = 0;
            self.y = 0;
            var width = target.offsetWidth;
            var height = target.offsetHeight;
            function makeNewPoint() {
                self.x = Math.random() * width;
                self.y = Math.random() * height;
            }
            function update(evt) {
                var distance = getDistance(cell.x, cell.y, self.x, self.y);
                if (distance < cell.speed) {
                    makeNewPoint();
                }
                cell.setTargetPoint(self);
            }
            makeNewPoint();
            setInterval(update, 20);
        }
        return function createMouseControl(target, cell) {
            return new AIControl(target, cell);
        };
    });
    //! node_modules/hbjs/src/utils/geom/getDistance.js
    define("getDistance", function() {
        return function getDistance(x1, y1, x2, y2) {
            return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
        };
    });
    //! src/cell.js
    internal("cell", [ "getAngle", "getPointOnCircle" ], function(getAngle, getPointOnCircle) {
        function Cell(context, x, y, radius, speed, color) {
            this.context = context;
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.speed = speed || 0;
            this.color = color || "green";
            this.lastPoint = {
                x: x,
                y: y
            };
        }
        Cell.prototype = {
            setTargetPoint: function(point) {
                this.lastPoint = point;
            },
            area: function() {
                return Math.PI * this.radius * this.radius;
            },
            eat: function(c) {
                var area = this.area() + c.area();
                var r2 = area / Math.PI;
                this.radius = Math.sqrt(r2);
            },
            update: function() {
                var point = this.lastPoint;
                if (this.speed) {
                    var angle = getAngle(this.x, this.y, point.x, point.y);
                    var targetPoint = getPointOnCircle(this.x, this.y, this.speed, angle);
                    this.x = targetPoint.x;
                    this.y = targetPoint.y;
                }
            },
            draw: function() {
                this.context.beginPath();
                this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
                this.context.fillStyle = this.color;
                this.context.fill();
                this.context.lineWidth = 1;
                this.context.strokeStyle = "#003300";
                this.context.stroke();
            }
        };
        return {
            create: function(context, x, y, radius, speed, color) {
                return new Cell(context, x, y, radius, speed, color);
            }
        };
    });
    //! node_modules/hbjs/src/utils/ajax/http.js
    define("http", [ "extend" ], function(extend) {
        var serialize = function(obj) {
            var str = [];
            for (var p in obj) if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
        };
        var win = window, CORSxhr = function() {
            var xhr;
            if (win.XMLHttpRequest && "withCredentials" in new win.XMLHttpRequest()) {
                xhr = win.XMLHttpRequest;
            } else if (win.XDomainRequest) {
                xhr = win.XDomainRequest;
            }
            return xhr;
        }(), methods = [ "head", "get", "post", "put", "delete" ], i, methodsLength = methods.length, result = {};
        function Request(options) {
            this.init(options);
        }
        function getRequestResult(that) {
            var headers = parseResponseHeaders(this.getAllResponseHeaders());
            var response = this.responseText.trim();
            var start;
            var end;
            if (response) {
                start = response[0];
                end = response[response.length - 1];
            }
            if (response && (start === "{" && end === "}") || start === "[" && end === "]") {
                response = response ? JSON.parse(response.replace(/\/\*.*?\*\//g, "")) : response;
            }
            return {
                data: response,
                request: {
                    method: that.method,
                    url: that.url,
                    data: that.data,
                    headers: that.headers
                },
                headers: headers,
                status: this.status
            };
        }
        Request.prototype.init = function(options) {
            var that = this;
            that.xhr = new CORSxhr();
            that.method = options.method;
            that.url = options.url;
            that.success = options.success;
            that.error = options.error;
            that.data = options.data;
            that.headers = options.headers;
            if (options.credentials === true) {
                that.xhr.withCredentials = true;
            }
            that.send();
            return that;
        };
        Request.prototype.send = function() {
            var that = this;
            if (that.method === "GET" && that.data) {
                var concat = that.url.indexOf("?") > -1 ? "&" : "?";
                that.url += concat + serialize(that.data);
            } else {
                that.data = JSON.stringify(that.data);
            }
            if (that.success !== undefined) {
                that.xhr.onload = function() {
                    var result = getRequestResult.call(this, that), self = this;
                    function onLoad() {
                        if (self.status >= 200 && self.status < 400) {
                            that.success.call(self, result);
                        } else if (that.error !== undefined) {
                            that.error.call(self, result);
                        }
                    }
                    if (this.onloadInterceptor) {
                        this.onloadInterceptor(onLoad, result);
                    } else {
                        onLoad();
                    }
                };
            }
            if (that.error !== undefined) {
                that.xhr.error = function() {
                    var result = getRequestResult.call(this, that);
                    that.error.call(this, result);
                };
            }
            that.xhr.open(that.method, that.url, true);
            if (that.headers !== undefined) {
                that.setHeaders();
            }
            that.xhr.send(that.data, true);
            return that;
        };
        Request.prototype.setHeaders = function() {
            var that = this, headers = that.headers, key;
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    that.xhr.setRequestHeader(key, headers[key]);
                }
            }
            return that;
        };
        function parseResponseHeaders(str) {
            var list = str.split("\n");
            var headers = {};
            var parts;
            var i = 0, len = list.length;
            while (i < len) {
                parts = list[i].split(": ");
                if (parts[0] && parts[1]) {
                    parts[0] = parts[0].split("-").join("").split("");
                    parts[0][0] = parts[0][0].toLowerCase();
                    headers[parts[0].join("")] = parts[1];
                }
                i += 1;
            }
            return headers;
        }
        function addDefaults(options, defaults) {
            return extend(options, defaults);
        }
        function handleInterceptor(options) {
            return !!(result.intercept && result.intercept(options, Request));
        }
        for (i = 0; i < methodsLength; i += 1) {
            (function() {
                var method = methods[i];
                result[method] = function(url, success, error) {
                    var options = {};
                    if (url === undefined) {
                        throw new Error("CORS: url must be defined");
                    }
                    if (typeof url === "object") {
                        options = url;
                    } else {
                        if (typeof success === "function") {
                            options.success = success;
                        }
                        if (typeof error === "function") {
                            options.error = error;
                        }
                        options.url = url;
                    }
                    options.method = method.toUpperCase();
                    addDefaults(options, result.defaults);
                    if (handleInterceptor(options)) {
                        return;
                    }
                    return new Request(options).xhr;
                };
            })();
        }
        result.intercept = null;
        result.defaults = {
            headers: {}
        };
        return result;
    });
    //! node_modules/hbjs/src/utils/data/extend.js
    define("extend", [ "toArray" ], function(toArray) {
        var extend = function(target, source) {
            var args = toArray(arguments), i = 1, len = args.length, item, j;
            var options = this || {}, copy;
            if (!target && source && typeof source === "object") {
                target = {};
            }
            while (i < len) {
                item = args[i];
                for (j in item) {
                    if (item.hasOwnProperty(j)) {
                        if (j === "length" && target instanceof Array) {} else if (target[j] && typeof target[j] === "object" && !item[j] instanceof Array) {
                            target[j] = extend.apply(options, [ target[j], item[j] ]);
                        } else if (item[j] instanceof Array) {
                            copy = options && options.concat ? (target[j] || []).concat(item[j]) : item[j];
                            if (options && options.arrayAsObject) {
                                if (!target[j]) {
                                    target[j] = {
                                        length: copy.length
                                    };
                                }
                                if (target[j] instanceof Array) {
                                    target[j] = extend.apply(options, [ {}, target[j] ]);
                                }
                            } else {
                                target[j] = target[j] || [];
                            }
                            if (copy.length) {
                                target[j] = extend.apply(options, [ target[j], copy ]);
                            }
                        } else if (item[j] && typeof item[j] === "object") {
                            if (options.objectAsArray && typeof item[j].length === "number") {
                                if (!(target[j] instanceof Array)) {
                                    target[j] = extend.apply(options, [ [], target[j] ]);
                                }
                            }
                            target[j] = extend.apply(options, [ target[j] || {}, item[j] ]);
                        } else if (options.override !== false || target[j] === undefined) {
                            target[j] = item[j];
                        }
                    }
                }
                i += 1;
            }
            return target;
        };
        return extend;
    });
    //! node_modules/hbjs/src/utils/formatters/toArray.js
    define("toArray", [ "isArguments", "isArray", "isUndefined" ], function(isArguments, isArray, isUndefined) {
        var toArray = function(value) {
            if (isArguments(value)) {
                return Array.prototype.slice.call(value, 0) || [];
            }
            try {
                if (isArray(value)) {
                    return value;
                }
                if (!isUndefined(value)) {
                    return [].concat(value);
                }
            } catch (e) {}
            return [];
        };
        return toArray;
    });
    //! node_modules/hbjs/src/utils/validators/isArguments.js
    define("isArguments", [ "toString" ], function(toString) {
        var isArguments = function(value) {
            var str = String(value);
            var isArguments = str === "[object Arguments]";
            if (!isArguments) {
                isArguments = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && (!value.callee || toString.call(value.callee) === "[object Function]");
            }
            return isArguments;
        };
        return isArguments;
    });
    //! node_modules/hbjs/src/utils/validators/isArray.js
    define("isArray", function() {
        Array.prototype.__isArray = true;
        Object.defineProperty(Array.prototype, "__isArray", {
            enumerable: false,
            writable: true
        });
        var isArray = function(val) {
            return val ? !!val.__isArray : false;
        };
        return isArray;
    });
    //! node_modules/hbjs/src/utils/validators/isUndefined.js
    define("isUndefined", function() {
        var isUndefined = function(val) {
            return typeof val === "undefined";
        };
        return isUndefined;
    });
    for (var name in cache) {
        resolve(name, cache[name]);
    }
})(this["evolution"] || {}, function() {
    return this;
}());