$(document).ready(function() {

    // Initialize a socket object from socket.io
    var socket = io();
    var name;
    var room;
    var ip;
    var timeRemaining;
    var startTime;
    var chatroom;

    // Send the user to the proper room
    getToRoom = function(room) {
        socket.emit('room', room);
    }

    catchUpChat = function(conversation) {
        for (i = 0; i < conversation.length; i++) {
            if(conversation[i].ipofSender === ip){
                $('.messages').append('<li><strong>'+conversation[i].sender+':&nbsp;</strong>'+conversation[i].message+'</li>');
            } else {
                $('.messages').append('<li class="otheruser"><strong>'+conversation[i].sender+':&nbsp;</strong>'+conversation[i].message+'</li>');
            }
        }
        fastScroll();
    }

    getChat = function(chatroom) {
        console.log("frontend chatroom is registered as", chatroom);
        $.ajax({
            url: '/getChat',
            data: {
                chatroom: chatroom,
            },
            type: 'POST',
            success: function(chatinfosent) {
                if (chatinfosent === "expired") {
                    window.location.href = "/loginhome";
                }
                console.log(chatinfosent);
                chatroom = chatinfosent['room'];
                console.log("We got the chatroom on the front end as", chatroom);
                catchUpChat(chatroom.Conversation);
                timeRemaining = chatinfosent['timeRemaining'];
                console.log("timeRemaining is", timeRemaining);
                time = new Date();
                startTime = time.getTime();
                // change startTime to remaining time
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    }

    // where we decide if they stay or go
    if (document.cookie != "") {
        // get the user's ip as identification
        $.get("http://ipinfo.io", function(response) {
            ip = response.ip;// This gives the user's IP address in string format
        }, "jsonp");

        name = Cookies.get('name');
        room = Cookies.get('room');
        getChat(room);
        getToRoom(room);
    } else {
        window.location.href = "/loginhome";
    }

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
        input = {'room': room, 'message':message, 'sender': name, 'name': name, 'id': ip};
        socket.emit('chat message', input);
        // // Clear the message area's text
        $('#m').val('');
        return false; // This is to not refresh the page after sending a message
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Process receiving messages
    var messages = document.getElementById('messages');
    console.log(messages);
    function scrollToBottom() {
        // messages.scrollTop = messages.scrollHeight; this is to scroll fast
        $('.messages').animate({
            scrollTop: messages.scrollHeight
        }, 200);
    };
    function fastScroll() {
        messages.scrollTop = messages.scrollHeight;
    };
    // When we receive a 'chat message' message...
    socket.on('recieve message', function(output) {
        // form of output is output = {'message':input['message'], name: input['name'], id:input['id'], 'room': input['room']};
        shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
        if(output['id'] === ip){
            $('.messages').append('<li><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        } else {
            $('.messages').append('<li class="otheruser"><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        }
        if (shouldScroll) {
            scrollToBottom();
        }
        if (wasTyping && output['id'] != ip){
            wasTyping = false;
            $('ul.messages').css({'height':'calc(100% - 47px)'});
            $('.typing').css({'display':'none'});
            if (shouldScroll){
                fastScroll();
            }
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handeling Closing chat

    otherUserClose = false;
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
        $('.useractionpopup').css({"display":"none", "opacity":"0"});
        $('#closeChatSection').css({'display':'none'});
        input = {'room': room, 'user': ip};
        if (otherUserClose) {
            socket.emit('close Chat', input);
        } else {
            $('.messages').append('<li><strong>Your partner has been alerted of your desire to close the chat</strong></li>');
            socket.emit('close attempt', input);
            fastScroll();
        }
    });

    socket.on('attempt close', function(output) {
        // input = {'room': user.chat_room, 'user': user.id};
        if (output['user'] != ip) {
            otherUserClose = true;
            $('.messages').append('<li class="otheruser"><strong>Your partner wishes to close the chat, close click the close chat button below to close it if you are both done</strong></li>');
            fastScroll();
        }
    });

    // $("#returnHome").click(function() {
    //     console.log("We should be redirected");
    //     window.location.href = "/loginhome";
    // });

    // chat is closed
    socket.on('chat closed', function(output) {
        // output = {'room': user.chat_room}; This is for the admin
        turnedOff = true;
        $('#closeChatSection').css({'display':'none'});
        $('#planSubmit').css({'display':'block'});
        $('#planSubmit').animate({'opacity':'1'}, 'slow');
        $('#m').prop("readonly", true);
        $('#m').val('');
        $('#timer').html('Chat closed');
        $('.messages').append('<li><strong>The Chat has been closed, please proceed below.</strong></li>');
        fastScroll();
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keep track of the timer
    // max time in minutes
    var warningTime = 5 * 60;
    var turnedOff = false;
    var warningGiven = false;
    // timeRemaining = chatinfosent['timeRemaining'];
    // time = new Date();
    // startTime = time.getTime();
    updateTimer = function(){
        time = new Date();
        currentTime = time.getTime();
        // get time remaining in seconds
        // remaining = Math.floor(maxTime - ((currentTime - startTime) / 1000));
        timeSince = (Number(currentTime) - Number(startTime))
        remaining = Math.floor((Number(timeRemaining) - timeSince)/1000)
        console.log();
        console.log();
        console.log("currentTime is", currentTime);
        console.log("startTime is", startTime);
        console.log("We start here");
        console.log("remaining is", remaining);
        console.log("timeSince is", timeSince);
        console.log("startTime is", startTime);
        // if no time left make it impossible to send more messages, then ideally redirect once we get instructions
        // for what we want to do with them after
        if (0 < remaining && remaining <= warningTime && !warningGiven){
            warningGiven = true;
            giveWarning();
        }
        if (remaining <= 0 || turnedOff){
            $('#closeChatSection').css({'display':'none'});
            $('#planSubmit').css({'display':'block'});
            $('#planSubmit').animate({'opacity':'1'}, 'slow');
            $('#m').prop("readonly", true);
            $('#m').val('');
            $('#timer').html('Chat closed');
            closeChat();
            turnedOff = true;
            clearInterval(keepTime);
            return;
        }
        // getting proper min/sec in string form;
        secLeft = (remaining % 60).toString();
        console.log("secLeft = (remaining % 60).toString() is", secLeft);
        minLeft = (Math.floor(remaining / 60)).toString();
        console.log("minLeft = (Math.floor(remaining / 60)).toString() is", minLeft);
        if (secLeft.length === 1){
            secLeft = "0" + secLeft;
        }
        // putting the time left together in min:sec form
        timeLeft = minLeft + ":" + secLeft;
        console.log("timeLeft is", timeLeft)
        $('#timeLeft').text(timeLeft);
    }
    var keepTime = setInterval(updateTimer, 200);

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    isTyping = false;
    function checkTyping(){
        message = $('#m').val();
        if (message.length > 0) {
            console.log("We should have emitted a message that the user is typing")
            isTyping = true;
            input = {'room': room, 'name': name, 'id':ip, 'message': message};
            socket.emit('user typing', input);
        } else if(isTyping && message.length === 0) {
            console.log("We should have emitted a message saying the user is no longer typing")
            isTyping = false;
            input = {'room': room, 'name': name, 'id': ip, 'message': message};
            socket.emit('user typing', input);
        }
    }
    var typingmodified = false;
    var wasTyping = false;
    socket.on('typing alert', function(output) {
        // form of output is output = {'id':input['id'], name: input['name'], message: input['message'], 'room':input['room']};
        // want to add name to this at some point
        // console.log("Output is", output);
        // console.log("the length of message is", output['message'].length);
        // ignore signs that I am typing
        console.log("We got the typing alert with this output", output);
        if (output['id'] != ip) {
            if (output['message'].length === 0 && wasTyping) {
                wasTyping = false;
                shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
                // $('ul.messages').css({'height':'18em'});
                $('ul.messages').css({'height':'calc(100% - 47px)'});
                $('.typing').css({'display':'none'});
                if (shouldScroll) {
                    fastScroll();
                }
            } else if(output['message'].length > 0 && !wasTyping) {
                if (!typingmodified){
                    typingmodified = true;
                    othertyping = output['name'] + " is typing. . ."
                    $('.typing').text(othertyping);
                }
                console.log("We recognize the other user is typing");
                wasTyping = true;
                shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
                $('ul.messages').css({'height':'calc(100% - 70px)'});
                $('.typing').css({'display':'block'});
                if (shouldScroll) {
                    fastScroll();
                }
            }
        }
    });
    setInterval(checkTyping, 200);

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Coding for the pop up with 5 minutes remaining

    function giveWarning(){
        $('#timewarning').css({"display":"block"});
        $('#timewarning').animate({"opacity":"1"}, "slow");
    }

    $(".closebox").click(function() {
        $('.useractionpopup').css({"display":"none", "opacity":"0"});
    });


    $("#opencloseChat").click(function() {
        $('#closechatpop').css({"display":"block"});
        $('#closechatpop').animate({"opacity":"1"}, "slow");
    });


});















