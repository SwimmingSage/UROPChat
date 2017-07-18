$(document).ready(function() {

    var socket = io();

    function redirect() {
        window.location.href = "/scenario1";
    }

    socket.on("sendToScenario1", function() {
        $('#joinqueue').css({"display":"none", "opacity": "0"});
        $('#joinroomsection').append('<p id="joinshortly">Your partner has arrived, you will begin shortly!</p>');
        $('#joinshortly').animate({'opacity':'1'}, 'slow');
        setTimeout(redirect, 5000)
    });

    $("#joinroomsection button").click(function(){
        $(".error").css({"display":"none"});
        var inputsystem = $("#inputsystem").val();
        var name = $("#inputname").val();
        var entryid = $("#inputid").val();
        if (name.length === 0) { // check if we should assign this user a username, if yes assign one randomly from the list below
            names = ['Jackson', 'Liam', 'Sam', 'Fred', 'Amy', 'Sophia', 'Olivia', 'Emma'];
            number = Math.floor(Math.random() * 8);
            name = names[number];
        }
        if (inputsystem.length === 0 || entryid.length === 0) { // check if chat system and entryid are both entered
            $("#incomplete").css({"display":"block"});
            return;
        }
        // backend call to check whether these inputsystem and entry id credentials are valid
        $.ajax({
            url: '/checkSystem',
            data: {
                name: name,
                system: inputsystem,
                id:   entryid,
            },
            type: 'POST',
            success: function(data) {
                if(data === "nosystem") {
                    $("#nosystem").css({"display":"block"});
                } else if (data === "systemBegun") {
                    login(entryid, true);
                } else {
                    $(".enterform").css({"display":"none"});
                    $('#joinroomsection button').css({"display":"none", "opacity": "0"});
                    $('#joinroomsection p').css({"display":"block", "opacity": "0"});
                    $('#joinroomsection p').animate({'opacity':'1'}, 'slow');
                    socket.emit('joinSystem', {'system': inputsystem, 'id': entryid});
                    login(entryid, false);
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    })

    function login(userID, redirect) {
        $.ajax({
            url: '/login',
            data: {
              username: userID,
              password: 1,
            },
            type: 'POST',
            success: function(data) {
                console.log("Successfully logged in");
                if (redirect) {
                    window.location.href = "/scenario1";
                }
            },
            error: function(xhr, status, error) {
              console.log("Uh oh there was an error: " + error);
            }
        })
    }

});





