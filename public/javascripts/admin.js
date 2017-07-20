$(document).ready(function() {

    var socket = io();

    var chatrooms, chattimes, startTime;
    var closed = {};
    var wasTyping = {};

    // Send the user to the proper room
    function getToRoom(room) {
        socket.emit('multiroom', room);
    }

    function getCurrentTime(){
        var time = new Date();
        return time.getTime();
    }

    $.ajax({
        url: '/getAllChat',
        data: {
        },
        type: 'GET',
        success: function(sentchatinfo) {
            // sentchatinfo = {"rooms":returndata, "times": startTimes}
            var id;
            chatrooms = sentchatinfo['rooms'];
            chattimes = sentchatinfo['times'];
            startTime = getCurrentTime();
            for (i=0; i < chatrooms.length; i++) {
                id = chatrooms[i].id
                getToRoom(chatrooms[i].id);
                wasTyping[id] = false;
                closed[id] = false;
            }
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }
    });


    function initialScroll(){
        var thisElement;
        $('.messages').each(function(i, obj) {
            thisElement = document.getElementById(obj.id);
            fastScroll(thisElement);
        });
    }
    window.onload = initialScroll;


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Process of sending out messages
    var x = 0
    function addToTime(){
        x += 1;
    }
    setInterval(addToTime, 200);

    $('form').submit(function() {
        var id, roomid, message, input;
        if (x === 0) {
            return false;
        } else {
            x = 0;
        }
        // this.id is the id of this element

        // Emit the 'chat message' message with socket.io
        // message = user.firstname + ": " + $('#m').val();
        id = this.id;
        roomid = id.slice(4, id.length);
        message = $('#m' + roomid).val();
        // I don't want to send empty messages
        if (message.length === 0){
            return false;
        }
        input = {'room': roomid, 'message':message, 'sender': "Admin", 'name': "Admin", 'id':"AdminID"};
        socket.emit('chat message', input);
        // // Clear the message area's text
        $('#m' + roomid).val('');
        return false; // This is to not refresh the page after sending a message
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Process receiving messages

    function scrollToBottom(id, element) {
        $('#messages' + id).animate({
            scrollTop: element.scrollHeight
        }, 200);
    };
    function fastScroll(element) {
        element.scrollTop = element.scrollHeight;
    };

    // When we receive a 'chat message' message...
    socket.on('recieve message', function(output) {
        // form of output is output = {'message':input['message'], name: input['name'], id:input['id'], 'room': input['room']};
        var thisid, messages, shouldScroll;
        thisid = output['room']
        messages = document.getElementById('messages' + thisid);
        // determine if user at bottom of chat, keeping up with the latest message
        shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
        if(output['name'] === "Admin"){
            $('#messages' + thisid).append('<li><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        } else {
            $('#messages' + thisid).append('<li class="otheruser"><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        }
        wasTyping[thisid] = false;
        $('#messages' + thisid).css({'height':'17em'});
        $('#typing'+output['room']).css({'display':'none'});
        if (shouldScroll) {
            fastScroll(messages);
        } else {
            scrollToBottom(thisid, messages);
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keep track of the timer
    // max time in minutes
    function updateTimer(timeRemaining, roomid){
        var currentTime, timeSince, timeLeft;
        currentTime = getCurrentTime();
        timeSince = (Number(currentTime) - Number(startTime))
        timeLeft = Math.floor((Number(timeRemaining) - timeSince)/1000) // in seconds
        if (timeLeft <= 0){ // if the chat is closed
            $('#m'+ roomid).prop("readonly", true);
            $('#m'+ roomid).val('');
            $('#timer'+ roomid).html('0:00');
            closed[roomid] = true;
            return;
        }
        editTimer(timeLeft);
    }
    // This edits the actual text on the timer
    function editTimer(timeLeft) {
        var secLeft, minLeft, timeLeftText;
        // getting proper min/sec in string form;
        secLeft = (timeLeft % 60).toString();
        minLeft = (Math.floor(timeLeft / 60)).toString();
        if (secLeft.length === 1){
            secLeft = "0" + secLeft;
        }
        // putting the time left together in min:sec form
        timeLeftText = minLeft + ":" + secLeft;
        $('#timer'+ id).text(timeLeftText);
    }
    // This updates the timers for every chat if it is not closed
    function updateTimes() {
        for (var roomid in chattimes) {
            if(!closed[roomid]) {
                updateTimer(chattimes[roomid], roomid);
            }
        }
    }

    setInterval(updateTimes, 400);

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    socket.on('typing alert', function(output) {
        // form of output is output = {'id':input['id'], name: input['name'], message: input['message'], 'room':input['room']};
        var roomid, messages, shouldScroll;
        roomid = output['room'];
        messages = document.getElementById('messages'+roomid);
        shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);

        if (output['message'].length === 0 && wasTyping[roomid]) {
            wasTyping[roomid] = false;
            $('ul#messages'+roomid).css({'height':'17em'});
            $('#typing'+roomid).css({'display':'none'});
        } else if(output['message'].length > 0 && !wasTyping[roomid]) {
            wasTyping[roomid] = true;
            $('ul#messages'+roomid).css({'height':'15.6em'});
            $('#typing'+roomid).css({'display':'block'});
        }
        if (shouldScroll) { // keep user at bottom of chat
            fastScroll(messages);
        }
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // When the chat is closed
    socket.on('chat closed', function(output) {
        // output  = {"redirect": redirect, "room": input['room']};
        var roomid;
        roomid = output['room'];
        closed[roomid] = true;
        $('#m'+ roomid).prop("readonly", true);
        $('#m'+ roomid).val('');
        $('#timer'+output['room']).html('0:00');
        $('#messages' + output['room']).append('<li><strong>Chat has been closed.</strong></li');
    });
});
























