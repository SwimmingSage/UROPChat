$(document).ready(function() {

    // Initialize a socket object from socket.io
    var socket = io();

    // Send the user to the proper room
    function getToRoom(room) {
        socket.emit('room', room);
    }

    function catchUpChat(conversation) {
        for (i = 0; i < conversation.length; i++) {
            if(conversation[i].sender === user.firstname){
                $('#messages').append('<li><strong>'+conversation[i].sender+':&nbsp;</strong>'+conversation[i].message+'</li>');
            } else {
                $('#messages').append('<li class="otheruser"><strong>'+conversation[i].sender+':&nbsp;</strong>'+conversation[i].message+'</li>');
            }
        }
        fastScroll();
    }

    // This grabs the user data from backend so we can get their first name
    var user;
    var startTime;
    var chatroom;
    $.ajax({
        url: '/getUser',
        data: {
        },
        type: 'GET',
        success: function(data) {
            user = data;
            getToRoom(data.chat_room);
            $.ajax({
                url: '/getChat',
                data: {
                },
                type: 'GET',
                success: function(chatroomsent) {
                    chatroom = chatroomsent['0'];
                    catchUpChat(chatroom.Conversation);
                    startTime = chatroom.creationTime;
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
        // I don't want to send empty messages
        if (message.length === 0){
            return false;
        }
        input = {'room': user.chat_room, 'message':message, 'sender': user.id, 'name': user.firstname, 'id':user.id};
        socket.emit('chat message', input);
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
    };
    function fastScroll() {
        messages.scrollTop = messages.scrollHeight;
    };
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
        if (wasTyping){
            wasTyping = false;
            $('ul#messages').css({'height':'18em'});
            $('#typing').css({'display':'none'});
            if (shouldScroll){
                fastScroll();
            }
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handeling Closing chat

    function closeChat() {
        $.ajax({
            url: '/closeChat',
            data: {
            },
            type: 'POST',
            success: function(data) {
                if(data = 'success') {
                    console.log("The chat was successfully closed");
                    turnedOff = true;
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    }

    $("#closeChat").click(function(){
        console.log("closeChat ran");
        input = {'room': user.chat_room};
        socket.emit('close Chat', input);
    });

    $("#returnHome").click(function() {
        console.log("We should be redirected");
        window.location.href = "/loginhome";
    });

    // chat is closed
    socket.on('chat closed', function() {
        turnedOff = true;
        $('#closeChatSection').css({'display':'none'});
        $('#goHome').css({'display':'block'});
        $('#goHome').animate({'opacity':'1'}, 'slow');
        $('#m').prop("readonly", true);
        $('#m').val('');
        $('#timer').html('The chat is now closed');
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keep track of the timer
    // max time in minutes
    var maxTime = 20*60 + 5;
    var turnedOff = false;
    function updateTimer(){
        console.log("UpdateTimer ran")
        time = new Date();
        currentTime = time.getTime();
        // get time remaining in seconds
        remaining = Math.floor(maxTime - ((currentTime - startTime) / 1000));
        // if no time left make it impossible to send more messages, then ideally redirect once we get instructions
        // for what we want to do with them after
        if (turnedOff) {
            return;
        }
        if (remaining <= 0){
            $('#closeChatSection').css({'display':'none'});
            $('#goHome').css({'display':'block'});
            $('#goHome').animate({'opacity':'1'}, 'slow');
            $('#m').prop("readonly", true);
            $('#m').val('');
            $('#timer').html('Chat has expired');
            closeChat();
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

    function checkTyping(){
        message = $('#m').val();
        input = {'room': user.chat_room, 'name': user.firstname, 'id':user.id, 'message': message};
        socket.emit('user typing', input);
    }
    var typingmodified = false;
    var wasTyping = false;
    socket.on('typing alert', function(output) {
        // form of output is output = {'id':input['id'], name: input['name'], message: input['message']};
        // want to add name to this at some point
        // console.log("Output is", output);
        // console.log("the length of message is", output['message'].length);
        // ignore signs that I am typing
        if (output['id'] != user.id) {
            if (output['message'].length === 0 && wasTyping) {
                wasTyping = false;
                shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
                $('ul#messages').css({'height':'18em'});
                $('#typing').css({'display':'none'});
                if (shouldScroll) {
                    fastScroll();
                }
            } else if(output['message'].length > 0 && !wasTyping) {
                if (!typingmodified){
                    typingmodified = true;
                    othertyping = output['name'] + " is typing. . ."
                    $('#typing').text(othertyping);
                }
                console.log("We recognize the other user is typing");
                wasTyping = true;
                shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
                $('ul#messages').css({'height':'16.6em'});
                $('#typing').css({'display':'block'});
                if (shouldScroll) {
                    fastScroll();
                }
            }
        }
    });
    setInterval(checkTyping, 200);

});















