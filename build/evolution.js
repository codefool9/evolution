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
    //! src/main.js
    internal("main", [ "cell", "mouseControl", "AIControl", "collision" ], function(cell, mouseControl, AIControl, collision) {
        var canvas = document.querySelector(".evolution");
        var width = 600;
        var height = 600;
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        function randomX() {
            return Math.random() * width;
        }
        function randomY() {
            return Math.random() * height;
        }
        var shapes = [];
        var c1 = cell.create(context, 250, 250, 20, 2, "blue");
        shapes.push(c1);
        mouseControl(canvas, c1);
        var c2 = cell.create(context, 250, 250, 20, 2, "red");
        shapes.push(c2);
        AIControl(canvas, c2);
        var p1 = cell.create(context, randomX(), randomY(), 10);
        shapes.push(p1);
        var p2 = cell.create(context, randomX(), randomY(), 10);
        shapes.push(p2);
        var p3 = cell.create(context, randomX(), randomY(), 10);
        shapes.push(p3);
        var p4 = cell.create(context, randomX(), randomY(), 10);
        shapes.push(p4);
        function render() {
            context.clearRect(0, 0, 600, 600);
            var i;
            var c;
            var collide;
            for (i = 0; i < shapes.length; i += 1) {
                c = shapes[i];
                c.update();
            }
            for (i = 0; i < shapes.length; i += 1) {
                c = shapes[i];
                if (c.speed) {
                    collide = collision(c, shapes);
                    if (collide) {
                        console.log("hit");
                        collide.setTargetPoint({
                            x: randomX(),
                            y: randomY()
                        });
                        collide.update();
                    }
                }
                c.draw();
            }
        }
        setInterval(render, 20);
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
                this.context.lineWidth = 5;
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
    for (var name in cache) {
        resolve(name, cache[name]);
    }
})(this["evolution"] || {}, function() {
    return this;
}());