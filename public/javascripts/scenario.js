$(document).ready(function() {
    var socket = io();

    socket.emit('in prep');

    // socket.on('userchange', function(output) {
    //     // output = {'prepCount': prepCount, 'readyCount': readyCount};
    //     $('#prepspan').text(output.prepCount);
    //     $('#readyspan').text(output.readyCount);
    // });

    // calling cookie in another page
    // console.log("Do we have a cookie?")
    // if (document.cookie != "") {
    //     console.log("We have a cookie");
    //     console.log("The name attribute of the cookie is", Cookies.get('name'))
    //     console.log("The room attribute of the cookie is", Cookies.get('room'))
    // } else {
    //     console.log("Guess not");
    // }
});



