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

    // make to manage users actions moving forward
    function makeCookies(system, name, userid) {
        // if there is already a preexisting cookie remove it
        if (document.cookie != "") {
            Cookies.expire('system');
            Cookies.expire('userid');
            Cookies.expire('name');
        }
        Cookies.set('system', system);
        Cookies.set('userid', userid);
        Cookies.set('name', name);
    }

    $("#joinroomsection button").click(function(){
        $(".error").css({"display":"none"});
        var inputsystem = $("#inputsystem").val();
        var username = $("#inputname").val();
        var entryid = $("#inputid").val();
        if (username.length === 0) { // check if we should assign this user a username, if yes assign one randomly from the list below
            names = ['Jackson', 'Liam', 'Sam', 'Fred', 'Amy', 'Sophia', 'Olivia', 'Emma'];
            number = Math.floor(Math.random() * 8);
            username = names[number];
        }
        if (inputsystem.length === 0 || entryid.length === 0) { // check if chat system and entryid are both entered
            $("#incomplete").css({"display":"block"});
            return;
        }
        // backend call to check whether these inputsystem and entry id credentials are valid
        $.ajax({
            url: '/checkSystem',
            data: {
                system: inputsystem,
                id:   entryid,
            },
            type: 'POST',
            success: function(data) {
                if(data === "nosystem") {
                    $("#nosystem").css({"display":"block"});
                } else if (data != "") {
                    window.location.href = data['redirect'];
                } else {
                    $(".enterform").css({"display":"none"});
                    $('#joinroomsection button').css({"display":"none", "opacity": "0"});
                    $('#joinroomsection p').css({"display":"block", "opacity": "0"});
                    $('#joinroomsection p').animate({'opacity':'1'}, 'slow');
                    makeCookies(inputsystem, username, entryid);
                    socket.emit('joinSystem', {'system': inputsystem, 'name': username, 'id': entryid});
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    })

});





