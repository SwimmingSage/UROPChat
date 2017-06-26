$(document).ready(function() {
    var socket = io();

    socket.emit('in prep');

    socket.on('userchange', function(output) {
        // output = {'prepCount': prepCount, 'readyCount': readyCount};
        $('#prepspan').text(output.prepCount);
        $('#readyspan').text(output.readyCount);
    });

});



