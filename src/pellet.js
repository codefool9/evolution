internal('pellet', function () {
    function Pellet(context, x, y, radius, color) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this._area = Math.PI * radius * radius;
    }

    Pellet.prototype = {
        update: function () {

        },
        area: function () {
            return this._area;
        },
        draw: function (tl, br) {
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
        create: function (context, x, y, radius, color) {
            return new Pellet(context, x, y, radius, color);
        }
    };
});
