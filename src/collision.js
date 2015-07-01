internal('collision', ['getDistance'], function(getDistance) {
    function collision(cell, cells) {
        var c;
        var dist;
        for(var i = 0; i < cells.length; i += 1) {
            c = cells[i];
            dist = getDistance(cell.x, cell.y, c.x, c.y);
            if(cell !== c && dist < cell.radius + c.radius) {
                return c;
            }
        }
    }

    return collision;
});