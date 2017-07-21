$(document).ready(function() {
    var socket = io();
    var system, userid;
    var timeRemaining, startTime, keepTime;

    function getCurrentTime(){
        var time = new Date();
        return time.getTime();
    }
    // Send the user to the proper system room 
    function getToRoom(system) {
        socket.emit('room', system);
    }

    prepPage();

    function prepPage() {
        $.ajax({
            url: '/getScenarioInfo',
            data: {
            },
            type: 'GET',
            success: function(data) {
                if(data['correct'] === "false") {
                    window.href.location = data['redirect'];
                } else {
                    timeRemaining = data['timeLeft'];
                    startTime = getCurrentTime();
                    system = data['system'];
                    userid = data['userID'];
                    getToRoom(system);
                    keepTime = setInterval(updateTime, 200);
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    }

    function updateTime(){
        time = new Date();
        currentTime = time.getTime();
        // get time remaining in seconds
        timeSince = (Number(currentTime) - Number(startTime))
        remaining = Math.floor((Number(timeRemaining) - timeSince)/1000)
        if (remaining <= 0){
            socket.emit('proceedScenario', system);
        }
        editTimer(remaining);
    }

    function editTimer(timeLeft) {
        // getting proper min/sec in string form;
        secLeft = (timeLeft % 60).toString();
        minLeft = (Math.floor(timeLeft / 60)).toString();
        if (secLeft.length === 1){
            secLeft = "0" + secLeft;
        }
        // putting the time left together in min:sec form
        timeLeftText = minLeft + ":" + secLeft;
        $('#timeLeft').text(timeLeftText);
    }

    var proceedReady = false; // keeps track of whether this user attempted to move on

    $("#proceed").click(function(){
        $("#scenariobutton").css({"display":"none", "opacity":"0"});
        $(".proceedWait").css({"display":"block"});
        $(".proceedWait").animate({"opacity":"1"}, "slow");
        proceedReady = true;
        input = {'system': system, 'user': userid};
        socket.emit('halfproceed', input);
    });

    socket.on('initiateproceed', function(initiatorID) {
        if ( (initiatorID !== userid) && (proceedReady) ) {
            socket.emit('proceedScenario', system);
        }
    });

    socket.on('proceedRedirect', function(redirect) {
        window.location.href = redirect;
    });


});



