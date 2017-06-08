$(document).ready(function() {

    // Initialize a socket object from socket.io
    var socket = io();

    function getToRoom(room) {
        console.log("We tryed to join the room", room);
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
            //$('where I want to put data').text(data);
            console.log("The data fromt the first ajax is", data);
            user = data;
            var room = data.chat_room;
            getToRoom(data.chat_room);
            $.ajax({
                url: '/getStartTime',
                data: {
                },
                type: 'GET',
                success: function(data) {
                    //$('where I want to put data').text(data);
                    
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
        message = user.firstname + ": " + $('#m').val()
        input = {'room': user.chat_room, 'message':message, 'sender': user.id};
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
        return false;
    });

    var messages = document.getElementById('messages');

    function scrollToBottom() {
        // messages.scrollTop = messages.scrollHeight;
        $('#messages').animate({
            scrollTop: messages.scrollHeight
        }, 200);
    }
    // When we receive a 'chat message' message...
    socket.on('recieve message', function(msg) {
        console.log('We recieved a message');
        // Add a new element to our chat with the message text
        $('#messages').append($('<li id="#newMessage">').text(msg));

        shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);

        if (!shouldScroll) {
            scrollToBottom();
        }

    });

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




});


