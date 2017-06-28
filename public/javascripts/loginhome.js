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
        // setTimeout(redirect, 5000)
    });

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    createCookie = function(room, username) {
        console.log("The current cookie is below");
        console.log(document.cookie, "is the cookie");
        console.log("We have no cookie right now");
        var d = new Date();
        d.setTime(d.getTime() + (2*24*60*60*1000)); // this way the cookie expires in 2 days
        // if there are cookies
        if (document.cookie != "") {
            document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "room=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        document.cookie = "name=" + username + "; expires=" + d.toUTCString() + ";path=/";
        document.cookie = "room=" + room + "; expires=" + d.toUTCString() + ";path=/"
        console.log("The cookie now is " + document.cookie);
        console.log("The name is", getCookie("name"));
        console.log("The room is", getCookie("room"));
    }

    var userIP;
    $.get("http://ipinfo.io", function(response) {
        userIP = response.ip;
        console.log(userIP);
        // This gives the user's IP address in string format
    }, "jsonp");

    $("#joinroomsection button").click(function(){
        $(".error").css({"display":"none"});
        var roomnumber = $("#inputroom").val();
        var name = $("#inputname").val();
        // createCookie(roomnumber, name);
        $.ajax({
            url: '/checkChat',
            data: {
                room: roomnumber,
            },
            type: 'POST',
            success: function(data) {
                if(data === "noroom") {
                    $("#noroom").css({"display":"block"});
                } else if (data === "expired") {
                    $("#chatused").css({"display":"block"});
                } else {
                    $('#joinroomsection button').css({"display":"none", "opacity": "0"});
                    $('#joinroomsection p').css({"display":"block", "opacity": "0"});
                    $('#joinroomsection p').animate({'opacity':'1'}, 'slow');
                    createCookie(roomnumber, name);
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





