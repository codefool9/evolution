internal('cell', ['getAngle','getPointOnCircle'], function (getAngle, getPointOnCircle) {
    function Cell(context, x, y, radius, speed, color) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed || 0;
        this.color = color || 'green';
        this.lastPoint = {x:x, y:y};
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
            this.context.strokeStyle = '#003300';
            this.context.stroke();
        }
    };

    return {
        create: function(context, x, y, radius, speed, color) {
            return new Cell(context, x, y, radius, speed, color);
        }
    };
});
