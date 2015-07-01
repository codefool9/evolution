internal('mouseControl', [], function () {
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