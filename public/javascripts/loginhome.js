$(document).ready(function() {

    var socket = io();

    function redirect() {
        window.location.href = "/messaging";
    }

    socket.on("sendToChat", function() {
        $('#joinqueue').css({"display":"none", "opacity": "0"});
        $('#joinroomsection').append('<p id="joinshortly">Another user has arrived, you will begin shortly!</p>');
        $('#joinshortly').animate({'opacity':'1'}, 'slow');
        setTimeout(redirect, 5000)
    });

    var userIP;
    $.get("http://ipinfo.io", function(response) {
        userIP = response.ip;
        console.log(userIP);
        // This gives the user's IP address in string format
    }, "jsonp");

    $("#joinroomsection button").click(function(){
        $(".error").css({"display":"none"});
        var roomnumber = $("#inputroom").text();
        var name = $("#inputname").text();
        $.ajax({
            url: '/checkChat',
            data: {
                roomID: roomnumber,
            },
            type: 'GET',
            success: function(data) {
                //$('where I want to put data').text(data);
                if(data === "noroom") {
                    $("#noroom").css({"display":"block"});
                } else if (data === "expired") {
                    $("#chatused").css({"display":"block"});
                } else {
                    $('#joinroomsection button').css({"display":"none", "opacity": "0"});
                    $('#joinroomsection p').css({"display":"block", "opacity": "0"});
                    $('#joinroomsection p').animate({'opacity':'1'}, 'slow');
                    socket.emit('joinRoom', {'room': roomnumber, 'name': name, 'ip': userIP});
                    // socket.emit('in ready');
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    })

    // Handle the count tracker
    // socket.emit('in prep');

    // socket.on('userchange', function(output) {
    //     // output = {'prepCount': prepCount, 'readyCount': readyCount};
    //     $('#prepspan').text(output.prepCount);
    //     $('#readyspan').text(output.readyCount);
    // });

});





