/*globals exports */
internal('main', ['cell', 'mouseControl', 'AIControl', 'collision'],
    function (cell, mouseControl, AIControl, collision) {
        window.hb = exports;
        var canvas = document.querySelector(".evolution");
        var width = 600;
        var height = 600;
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");

        var level = 1;
        var AIPlayers = [];
        //TODO: make all AI cells start away from the player to give starting room.
        //difine area for player to start and AI cells cannot start in.
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
                var c2 = cell.create(context, Math.random() * width, Math.random() * height, 10, 2, 'red');
                c2.type = 'ai';
                shapes.push(c2);
                AIPlayers.push(c2);
                AIControl(canvas, c2);
            }
        }

        function createPellets(numOfPellets) {
            for (i = 0; i < numOfPellets; i += 1) {
                var p1 = cell.create(context, randomX(), randomY(), Math.random() * 2 + 2);
                p1.type = 'pellet';
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
                    c.speed = (width / (c.radius * 0.5)) / 30;
                    collide = collision(c, shapes);
                    if (collide && collide.radius < c.radius) {
                        c.eat(collide);
                        if (collide.type === 'ai') {
                            index = AIPlayers.indexOf(collide);
                            //if (index !== -1) {
                            //    AIPlayers.splice(index, 1);
                            //    if (AIPlayers.length === 0) {
                            //        console.log("level up", level);
                            //        level += 1;
                            //        createAIControls(level);
                            //        player.radius = defaultSize;
                            //    }
                            //}
                        } else if (collide === player) {
                            console.log("game over");
                        } else if (collide.type === 'pellet') {
                            createPellets(1);
                        }
                        // remove the shape that was eaten.
                        shapes.splice(shapes.indexOf(collide), 1);
                    }
                }
                c.draw();
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

        player = cell.create(context, 250, 250, defaultSize, 2, 'blue');
        player.id = Date.now();
        player.name = prompt('Please enter your name');
        shapes.push(player);
        mouseControl(canvas, player);
        //createAIControls(level);
        setInterval(render, 20);
        createPellets(100);


        function connect() {
            var p2p = new P2P('g5ezqak33ze3766r', 'evolution', player);

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
                        plr = cell.create(context, message.player.x, message.player.y, defaultSize, 2, message.player.color)
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