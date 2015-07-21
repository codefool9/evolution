internal('AIControl', ['getDistance'], function (getDistance) {
    function AIControl(cell, width, height) {
        var self = this;
        self.x = 0;
        self.y = 0;

        function makeNewPoint() {
            self.x = Math.random() * width;
            self.y = Math.random() * height;
        }

        function update(evt) {
            var distance = getDistance(cell.x, cell.y, self.x, self.y);
            if(distance < cell.speed) {
                makeNewPoint();
            }
            cell.setTargetPoint(self);
        }
        makeNewPoint();
        setInterval(update, 20);
    }

    return function createMouseControl(cell, width, height) {
        return new AIControl(cell, width, height);
    };
});