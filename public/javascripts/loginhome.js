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

    function redirect() {
        window.location.href = "/messaging";
    }

    socket.on("sendToChat", function() {
        $('#joinqueue').css({"display":"none", "opacity": "0"});
        $('.joinchat').append('<p id="joinshortly">Another user has arrived, you will begin shortly</p>');
        $('#joinshortly').animate({'opacity':'1'}, 'slow');
        setTimeout(redirect, 5000)
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
                    $('.joinchat p').animate({'opacity':'1'}, 'slow');
                    socket.emit('joinRoom', {'userid': user.id, 'name': user.firstname});
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    })

});





