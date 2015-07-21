internal('mouseControl', [], function () {
    function MouseControl(target) {
        var self = this;
        self.x = 0;
        self.y = 0;

        function onMouseMove(evt) {
            self.x = evt.offsetX;
            self.y = evt.offsetY;
        }

        target.addEventListener("mousemove", onMouseMove);
    }

    return function createMouseControl(target) {
        return new MouseControl(target);
    };
});