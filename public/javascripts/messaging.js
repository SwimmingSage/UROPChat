$(document).ready(function() {

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
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }
    });

    // Initialize a socket object from socket.io
    var socket = io();
    // When we click the submit button...
    $('form').submit(function() {
        console.log('submitted');
        // Emit the 'chat message' message with socket.io
        socket.emit('chat message', user.firstname + ": " + $('#m').val());
        // Clear the message area's text
        $('#m').val('');
        // Don't reload the page
        return false;
    });
    // When we receive a 'chat message' message...
    socket.on('chat message', function(msg) {
        // Add a new element to our chat with the message text
        $('#messages').append($('<li>').text(msg));
    });
});