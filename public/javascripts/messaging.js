$(document).ready(function() {

    // Initialize a socket object from socket.io
    var socket = io();

    function getToRoom(room) {
        socket.emit('room', room);
    }

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
            console.log("the data that ajax gets is", data);
            console.log("In the ajax the room is", data.chat_room);
            getToRoom(data.chat_room);
            // getToRoom(data.chat_room);
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }
    });


    var x = 0

    function addToTime(){
        x += 1;
    }

    setInterval(addToTime, 200)

    $('form').submit(function() {
        if (x === 0) {
            return false;
        } else {
            x = 0;
        }
        console.log('submitted');
        // Emit the 'chat message' message with socket.io
        // socket.emit('chat message', user.firstname + ": " + $('#m').val());
        message = user.firstname + ": " + $('#m').val()
        input = {'room': user.chat_room, 'message':message}
        socket.emit('chat message', input);

        $.ajax({
            url: '/newMessage',
            data: {
                chatID:     user.chat_room,
                newmessage: message,
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















});


