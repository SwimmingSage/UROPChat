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


    $('form').submit(function() {
        console.log('submitted');
        // Emit the 'chat message' message with socket.io
        // socket.emit('chat message', user.firstname + ": " + $('#m').val());
        message = user.firstname + ": " + $('#m').val()
        input = {'room': user.chat_room, 'message':message}
        socket.emit('chat message', input);
        // // Clear the message area's text
        $('#m').val('');
        return false;
    });

    // When we receive a 'chat message' message...
    socket.on('recieve message', function(msg) {
        console.log('We recieved a message');
        // Add a new element to our chat with the message text
        $('#messages').append($('<li>').text(msg));
    });
});


