$(document).ready(function() {
    var socket = io();
    var name, system, userid;

    checkScenarioTimer = function(system, id) {
        $.ajax({
            url: '/checkSystem',
            data: {
                system: inputsystem,
                id:   entryid,
                confirm: "yes",
                page: currentpage,
            },
            type: 'POST',
            success: function(data) {
                if(data === "nosystem") {
                    $("#nosystem").css({"display":"block"});
                } else if (data != "") {
                    window.location.href = data;
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
    }

    // where we decide if they stay or go
    if (document.cookie != "") {
        name = Cookies.get('name');
        system = Cookies.get('system');
        userid = Cookies.get('userid');
        checkScenarioTimer(system, userid);
    } else {
        window.location.href = "/loginhome";
    }

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



