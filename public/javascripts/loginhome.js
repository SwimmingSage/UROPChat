$(document).ready(function() {

    // This grabs the user data from backend so we can get their first name
    var user;
    $.ajax({
        url: '/getUser',
        data: {
        },
        type: 'GET',
        success: function(data) {
            //$('where I want to put data').text(data);
            user = data;
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }
    });


    var socket = io();

    socket.on("sendToChat", function() {
        window.location.href = "/messaging";
    });

    $(".joinchat button").click(function(){
        $.ajax({
            url: '/checkInChat',
            data: {
            },
            type: 'GET',
            success: function(data) {
                //$('where I want to put data').text(data);
                if(data === "inchat") {
                    window.location.href = "/messaging";
                } else {
                    $('.joinchat button').css({"display":"none", "opacity": "0"});
                    $('.joinchat p').css({"display":"block", "opacity": "0"});
                    $('.joinchat p').animate({'opacity':'0.97'}, 'slow');
                    console.log("Safari went rogue to join chat");
                    socket.emit('joinRoom', {'userid': user.id, 'name': user.firstname});
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    })

});





