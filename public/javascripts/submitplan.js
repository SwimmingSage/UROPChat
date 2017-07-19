$(document).ready(function() {
    var socket = io();
    var name, system, userid;
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
            url: '/getSubmitInfo',
            data: {
            },
            type: 'GET',
            success: function(data) {
                if(data['correct'] === "false") {
                    window.href.location = data['redirect'];
                } else {
                    name = data['name'];
                    system = data['system'];
                    userid = data['userID'];
                    timeRemaining = data['timeLeft'];
                    startTime = getCurrentTime();
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
        currentTime = getCurrentTime();
        // get time remaining in seconds
        timeSince = (Number(currentTime) - Number(startTime))
        timeLeft = Math.floor((Number(timeRemaining) - timeSince)/1000)
        if (timeLeft <= 0){
            socket.emit('proceed', system);
        }
        editTimer(timeLeft);
    }

    function editTimer(timeLeft) {
        // getting proper min/sec in string form;
        secLeft = (timeLeft % 60).toString();
        minLeft = (Math.floor(timeLeft / 60)).toString();
        if (secLeft.length === 1){
            secLeft = "0" + secLeft;
        }
        // putting the time left together in min:sec form
        timeLeft = minLeft + ":" + secLeft;
        $('#timeLeft').text(timeLeft);
    }

    var proceedReady = false; // keeps track of whether this user attempted to move on

    socket.on('initiateproceed', function(initiatorID) {
        if (initiatorID === userid && !proceedReady) {
            proceedReady = true;
        }
        if ( (initiatorID !== userid) && (proceedReady) ) {
            socket.emit('proceed', system);
        }
    });

    socket.on('proceedRedirect', function(redirect) {
        window.location.href = redirect;
    });  

});



















