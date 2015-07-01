internal('AIControl', ['getDistance'], function (getDistance) {
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
            if(distance < cell.speed) {
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