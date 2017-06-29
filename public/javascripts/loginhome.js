$(document).ready(function() {

    var socket = io();

    function redirect() {
        window.location.href = "/messaging";
    }

    socket.on("sendToChat", function() {
        $('#joinqueue').css({"display":"none", "opacity": "0"});
        $('#joinroomsection').append('<p id="joinshortly">Another user has arrived, you will begin shortly!</p>');
        $('#joinshortly').animate({'opacity':'1'}, 'slow');
        console.log("We would have been sent to the chat");
        setTimeout(redirect, 5000)
    });

    makeCookies = function(room, name, userid) {
        // if there is already a preexisting cookie remove it
        if (document.cookie != "") {
            Cookies.expire('room');
            Cookies.expire('userid');
            Cookies.expire('name');
        }
        Cookies.set('name', name);
        Cookies.set('room', room);
        Cookies.set('userid', userid);
        console.log("The cookie document is now", document.cookie);
        console.log("The name attribute of the cookie is", Cookies.get('name'))
        console.log("The room attribute of the cookie is", Cookies.get('room'))
        console.log("The userid attribute of the cookie is", Cookies.get('userid'));
    }

    $("#joinroomsection button").click(function(){
        $(".error").css({"display":"none"});
        var roomnumber = $("#inputroom").val();
        var username = $("#inputname").val();
        var entryid = $("#inputid").val();

        if (roomnumber.length === 0 || entryid.length === 0) {
            $("#incomplete").css({"display":"block"});
            return;
        }

        $.ajax({
            url: '/checkChat',
            data: {
                room: roomnumber,
                id:   entryid,
            },
            type: 'POST',
            success: function(data) {
                if(data === "noroom") {
                    $("#noroom").css({"display":"block"});
                } else if (data === "expired") {
                    $("#chatused").css({"display":"block"});
                } else if (data === "active") {
                    makeCookies(roomnumber, username);
                    window.location.href = "/messaging";
                } else {
                    $(".enterform").css({"display":"none"});
                    $('#joinroomsection button').css({"display":"none", "opacity": "0"});
                    $('#joinroomsection p').css({"display":"block", "opacity": "0"});
                    $('#joinroomsection p').animate({'opacity':'1'}, 'slow');
                    makeCookies(roomnumber, username, entryid);
                    socket.emit('joinRoom', {'room': roomnumber, 'name': username, 'id': entryid});
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





