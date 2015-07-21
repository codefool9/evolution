/*globals exports */
internal('main', ['cell', 'mouseControl', 'AIControl', 'collision'],
    function (cell, mouseControl, AIControl, collision) {
        window.hb = exports;
        var colors = ['#3F51B5', '#4CAF50', '#FF9800', '#f93b39', '#de9c1b', '#008bf5', '#708bca', '#87a5ae', '#ff6092'];
        var color = randomColor();
        var canvas = document.querySelector(".evolution");
        var width = 2000;
        var height = 2000;
        var viewWidth = 800;
        var viewHeight = 800;
        canvas.width = viewWidth;
        canvas.height = viewHeight;
        var context = canvas.getContext("2d");

        var level = 1;
        var AIPlayers = [];
        //TODO: make all AI cells start away from the player to give starting room.
        //difine area for player to start and AI cells cannot start in.
        var shapes = [];
        var i;
        var defaultSize = 7.5;
        var player;
        var mouse;

        function randomX() {
            return Math.random() * width;
        }

        function randomY() {
            return Math.random() * height;
        }

        function randomColor() {
            return colors[Math.floor(Math.random() * colors.length)];
        }

        function createAIControls(max) {
            for (i = 0; i < max; i += 1) {
                var c2 = cell.create(context, Math.random() * width, Math.random() * height, 10, 2, color);
                c2.type = 'ai';
                c2.id = performance.now();
                shapes.push(c2);
                AIPlayers.push(c2);
                AIControl(c2, width, height);
            }
        }

        function createPellets(numOfPellets) {
            for (i = 0; i < numOfPellets; i += 1) {
                var p1 = cell.create(context, randomX(), randomY(), Math.random() * 3 + 3);
                p1.type = 'pellet';
                shapes.push(p1);
            }
        }

        function render() {
            context.clearRect(0, 0, viewWidth, viewHeight);
            var i;
            var c;
            var collide;

            var cx = player.x;
            var cy = player.y;
            var vw2 = viewWidth * 0.5;
            var vh2 = viewHeight * 0.5;
            if (cx < vw2) {
                cx = vw2;
            } else if (cx > width - vw2) {
                cx = width - vw2;
            }
            if (cy < vh2) {
                cy = vh2;
            } else if (cy > height - vh2) {
                cy = height - vh2;
            }
            var tl = {x: cx - vw2, y: cy - vh2};
            var br = {x: cx + vw2, y: cy + vh2};
            player.setTargetPoint({x: tl.x + mouse.x, y: tl.y + mouse.y});

            for (i = 0; i < shapes.length; i += 1) {
                c = shapes[i];
                c.update();
            }
            for (i = 0; i < shapes.length; i += 1) {
                c = shapes[i];
                if (c.speed) {
                    c.speed = (width / (c.radius * 0.5)) / 50;
                    collide = collision(c, shapes);
                    if (collide && collide.radius < c.radius) {
                        c.eat(collide);
                        if (collide.type === 'ai') {
                            handleLevelUp(collide);
                        } else if (collide === player) {
                            console.log("game over");
                        } else if (collide.type === 'pellet') {
                            createPellets(1);
                        }
                        // remove the shape that was eaten.
                        shapes.splice(shapes.indexOf(collide), 1);
                    }
                }
                c.draw(tl, br);
            }
        }

        function handleLevelUp(collide) {
            var index = AIPlayers.indexOf(collide);
            if (index !== -1) {
                AIPlayers.splice(index, 1);
                if (AIPlayers.length === 0) {
                    console.log("level up", level);
                    level += 1;
                    createAIControls(level);
                    player.radius = defaultSize;
                }
            }
        }

        function findPlayer(playerId) {
            // loop through shapes. See if playerId is the shape id.
            var id;
            for (var i = 0; i < shapes.length; i += 1) {
                id = shapes[i].id;
                if (id && playerId === id.toString()) {
                    return shapes[i];
                }
            }
        }

        player = cell.create(context, 250, 250, defaultSize, 2, color);
        player.id = Date.now();
        player.name = prompt('Please enter your name');
        shapes.push(player);
        mouse = mouseControl(canvas);
        setInterval(render, 40);
        createPellets(200);


        function connect() {
            var p2p = new P2P('g5ezqak33ze3766r', 'evolution', player);

            function update() {
                if (shapes.indexOf(player) === -1) {
                    return;
                }
                var aip;
                var data = {
                    shapes: [{
                        id: player.id.toString(),
                        x: player.x,
                        y: player.y,
                        tx: player.lastPoint.x,
                        ty: player.lastPoint.y,
                        radius: player.radius,
                        color: player.color,
                        status: player.status,
                        scoore: player.score,
                        lastUpdate: Date.now()
                    }]
                };
                for (var i = 0; i < AIPlayers.length; i += 1) {
                    aip = AIPlayers[i];
                    data.shapes.push({
                        id: aip.id.toString(),
                        x: aip.x,
                        y: aip.y,
                        tx: aip.lastPoint.x,
                        ty: aip.lastPoint.y,
                        radius: aip.radius,
                        color: aip.color,
                        status: aip.status,
                        lastUpdate: Date.now()
                    });
                }
                p2p.send(data);

                setTimeout(update, 100);
            }

            p2p.onMessage(function (message) {
                for(var i = 0; i < message.shapes.length; i += 1) {
                    var s = message.shapes[i];
                    var plr;
                    if (s.status === 'dead') {
                        return;
                    }
                    plr = findPlayer(s.id);
                    if (plr && s.lastUpdate < Date.now() - 1000) {
                        shapes.splice(shapes.indexOf(plr), 1);
                        plr.status = 'dead';
                    }
                    if (!plr) {
                        plr = cell.create(context, s.x, s.y, defaultSize, 2, s.color);
                        plr.id = s.id;
                        shapes.push(plr);
                    }
                    plr.x = s.x;
                    plr.y = s.y;
                    plr.lastPoint = plr.lastPoint || {};
                    plr.lastPoint.x = s.tx;
                    plr.lastPoint.y = s.ty;
                    plr.radius = s.radius;
                }
            });


            p2p.connect(update);
        }

        //if (AIEnabled) {
            createAIControls(level);
        //} else {
            connect();
        //}
    });