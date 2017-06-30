$(document).ready(function() {

    var socket = io();

    function redirect() {
        window.location.href = "/messaging";
    }

    socket.on("sendToChat", function() {
        $('#joinqueue').css({"display":"none", "opacity": "0"});
        $('#joinroomsection').append('<p id="joinshortly">Your partner has arrived, you will begin shortly!</p>');
        $('#joinshortly').animate({'opacity':'1'}, 'slow');
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
    }

    $("#joinroomsection button").click(function(){
        $(".error").css({"display":"none"});
        var roomnumber = $("#inputroom").val();
        var username = $("#inputname").val();
        var entryid = $("#inputid").val();
        console.log("username is", username);
        console.log("username.length  is", username.length);
        if (username.length === 0) {
            names = ['Jackson', 'Liam', 'Sam', 'Fred', 'Amy', 'Sophia', 'Olivia', 'Emma'];
            number = Math.floor(Math.random() * 8);
            console.log("number is", number);
            username = names[number];
            console.log("username is", username);
        }

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

});





