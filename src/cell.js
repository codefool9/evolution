internal('cell', ['getAngle','getPointOnCircle'], function (getAngle, getPointOnCircle) {
    function Cell(context, x, y, radius, speed, color) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed || 0;
        this.color = color || 'green';
        this.lastPoint = {x:x, y:y};
        this.status = 'alive';
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
            c.status = 'dead';
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
        draw: function(tl, br) {
            var x, y;
            if (this.x > tl.x && this.x < br.x && this.y > tl.y && this.y < br.y) {
                x = this.x - tl.x;
                y = this.y - tl.y;
                this.context.beginPath();
                this.context.arc(x, y, this.radius, 0, 2 * Math.PI, false);
                this.context.fillStyle = this.color;
                this.context.fill();
                this.context.lineWidth = 1;
                this.context.strokeStyle = '#003300';
                this.context.stroke();
            }
        }
    };

    return {
        create: function(context, x, y, radius, speed, color) {
            return new Cell(context, x, y, radius, speed, color);
        }
    };
});
