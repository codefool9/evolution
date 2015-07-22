internal('colors', function () {

    var colors = ['#3F51B5', '#4CAF50', '#FF9800', '#f93b39', '#de9c1b', '#008bf5', '#708bca', '#87a5ae', '#ff6092'];
    function randomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    return {
        color: randomColor(),
        randomColor: randomColor
    };
});