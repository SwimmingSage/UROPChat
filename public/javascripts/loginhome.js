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
        // I'm also gonna want to make a backend call here to initialize creating a chat room, but not gonna make one quite
        // yet I think as I dont' want to make chat room objects unless I have both users
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
                    socket.emit('joinRoom', user.id);
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    })

});





