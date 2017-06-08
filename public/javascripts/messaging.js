$(document).ready(function() {

    // Initialize a socket object from socket.io
    var socket = io();

    // Send the user to the proper room
    function getToRoom(room) {
        socket.emit('room', room);
    }

    // This grabs the user data from backend so we can get their first name
    var user;
    var startTime;
    $.ajax({
        url: '/getUser',
        data: {
        },
        type: 'GET',
        success: function(data) {
            user = data;
            getToRoom(data.chat_room);
            $.ajax({
                url: '/getStartTime',
                data: {
                },
                type: 'GET',
                success: function(data) {
                    startTime = data;
                    console.log("The data that is start time is", data);
                },
                error: function(xhr, status, error) {
                    console.log("Uh oh there was an error: " + error);
                }
            });
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Process of sending out messages
    var x = 0
    function addToTime(){
        x += 1;
    }
    setInterval(addToTime, 200);

    $('form').submit(function() {
        if (x === 0) {
            return false;
        } else {
            x = 0;
        }
        // Emit the 'chat message' message with socket.io
        // message = user.firstname + ": " + $('#m').val();
        message = $('#m').val();
        input = {'room': user.chat_room, 'message':message, 'sender': user.id, 'name': user.firstname};
        socket.emit('chat message', input);
        $.ajax({
            url: '/newMessage',
            data: {
                chatID:     user.chat_room,
                newmessage: message,
                sender:     user.firstname,
            },
            type: 'POST',
            success: function(data) {
                console.log("Message successfully stored");
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
        // // Clear the message area's text
        $('#m').val('');
        return false; // This is to not refresh the page after sending a message
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Process receiving messages
    var messages = document.getElementById('messages');

    function scrollToBottom() {
        // messages.scrollTop = messages.scrollHeight; this is to scroll fast
        $('#messages').animate({
            scrollTop: messages.scrollHeight
        }, 200);
    }
    // When we receive a 'chat message' message...
    socket.on('recieve message', function(output) {
        // form of output is output = {'message':input['message'], name: input['name']};
        shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
        if(output['name'] === user.firstname){
            $('#messages').append('<li><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        } else {
            $('#messages').append('<li class="otheruser"><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        }
        if (shouldScroll) {
            scrollToBottom();
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keep track of the timer
    // max time in minutes
    maxTime = 20*60;

    function updateTimer(){
        console.log("UpdateTimer ran")
        time = new Date();
        currentTime = time.getTime();
        // get time remaining in seconds
        remaining = Math.floor(maxTime - ((currentTime - startTime) / 1000));
        // if no time left make it impossible to send more messages, then ideally redirect once we get instructions
        // for what we want to do with them after
        if (remaining <= 0){
            $('#m').prop("readonly", true);
            $('#m').val('');
            $('#timer').html('Chat has expired');
            return;
        }
        // getting proper min/sec in string form;
        secLeft = (remaining % 60).toString();
        minLeft = (Math.floor(remaining / 60)).toString();
        if (secLeft.length === 1){
            secLeft = "0" + secLeft;
        }
        // putting the time left together in min:sec form
        timeLeft = minLeft + ":" + secLeft;
        $('#timeLeft').text(timeLeft);
    }

    setInterval(updateTimer, 200);

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // function checkTyping(){
    //     message = $('#m').val();
    //     if (message.length > 0) {
    //         input = {'name': user.firstname, 'id':user.id};
    //         socket.emit('user typing', input);
    //     } else if {

    //     }
    // }

    // socket.on()
    // setInterval(checkTyping, 200);

});















