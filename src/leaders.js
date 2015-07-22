internal('leaders', function () {
    function LeaderBoard() {
        var scores = [];
        var el = document.querySelector('.leaders');
        function add(c) {
            var change = false;
            var str = '';
            if (c.score) {
                for (var i = 0; i < scores.length; i += 1) {
                    while (c === scores[i]) {
                        scores.splice(i, 1);
                    }
                    if (scores[i] && scores[i].status === 'alive' && c.score > scores[i].score) {
                        scores.splice(i, 0, c);
                        i += 1;
                        change = true;
                        break;
                    }
                }
                if (!change && scores.length < 10 && scores.indexOf(c) === -1) {
                    scores.push(c);
                    change = true;
                }
                if (change && scores.length > 10) {
                    scores.length = 10;
                }
                if (change) {
                    if (el) {
                        for (i = 0; i < scores.length; i += 1) {
                            if (!scores[i].alive) {
                                scores.splice(i, 1);
                            }
                            if (scores[i]) {
                                str += '<li><span class="leader-name">' + scores[i].name + '</span> <span class="leader-score">' + Math.floor(scores[i].score) + '</span></li>\n';
                            }
                        }
                        el.innerHTML = str;
                    }
                }
            }
        }

        this.add = add;
        this.scores = scores;
    }

    return new LeaderBoard();
});