internal('main', ['cell', 'mouseControl', 'AIControl', 'collision'],
    function (cell, mouseControl, AIControl, collision) {
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
        // c1
        var c1 = cell.create(context, 250, 250, 20, 2, 'blue');
        shapes.push(c1);
        mouseControl(canvas, c1);
        // c2
        var c2 = cell.create(context, 250, 250, 20, 2, 'red');
        shapes.push(c2);
        AIControl(canvas, c2);

        // p1
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
                if(c.speed) {
                    collide = collision(c, shapes);
                    if (collide) {
                        console.log('hit');
                        collide.setTargetPoint({x:randomX(), y:randomY()});
                        collide.update();
                    }
                }
                c.draw();
            }
        }

        setInterval(render, 20);

    });