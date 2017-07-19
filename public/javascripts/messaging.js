$(document).ready(function() {

    // Initialize a socket object from socket.io
    var socket = io();
    var name, room, userid, timeRemaining, startTime, chatroom, system, keepTime;

    // Send the user to the proper room
    function getToRoom(room) {
        socket.emit('room', room);
    }

    function getCurrentTime(){
        var time = new Date();
        return time.getTime();
    }

    function catchUpChat(conversation) {
        var l = conversation.length; // doing this increases speed by not having to call length property over and over
        for (i = 0; i < l; i++) {
            if(conversation[i].idofSender === userid){
                $('.messages').append('<li><strong>You:&nbsp;</strong>'+conversation[i].message+'</li>');
            } else {
                $('.messages').append('<li class="otheruser"><strong>'+conversation[i].sender+':&nbsp;</strong>'+conversation[i].message+'</li>');
            }
        }
        fastScroll();
    }

    prepPage();

    function prepPage() {
        $.ajax({
            url: '/getChatInfo',
            data: {
            },
            type: 'GET',
            success: function(data) {
                if(data['correct'] === "false") {
                    window.href.location = data['redirect'];
                } else {
                    // data = {'correct': 'true', 'room': chatroom, 'timeLeft': timeLeft, 'systemID': req.user.systemID, 'userID': req.user.id, 'name': req.user.name};
                    console.log("data is: ");
                    console.log(data);
                    chatroom = data['room'];
                    room = chatroom.id;
                    system = data['systemID'];
                    timeRemaining = data['timeLeft'];
                    userid = data['userID'];
                    name = data['name'];
                    startTime = getCurrentTime();
                    getToRoom(room);
                    catchUpChat(chatroom.Conversation);
                    keepTime = setInterval(updateTimer, 200);
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Process of sending out messages
    var timeSinceMessage = 0
    function addToTime(){
        timeSinceMessage += 1;
    }
    setInterval(addToTime, 200);

    $('form').submit(function() {
        var input, message;
        if (timeSinceMessage === 0) { // so users can't spam messages
            return false;
        } else {
            timeSinceMessage = 0;
        }
        message = $('#m').val();
        if (message.length === 0){ // I don't want to send empty messages
            return false;
        }
        input = {'room': room, 'message':message, 'sender': name, 'name': name, 'id': userid};
        socket.emit('chat message', input);
        $('#m').val(''); // Clear the message area's text
        return false; // This is to not refresh the page after sending a message, which forms inherently do
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Process receiving messages
    var messages = document.getElementById('messages');
    function scrollToBottom() {
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
        if(output['id'] === userid){
            $('.messages').append('<li><strong>You:&nbsp;</strong>'+output['message']+'</li>');
        } else {
            $('.messages').append('<li class="otheruser"><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        }
        if (wasTyping && output['id'] != userid){
            wasTyping = false;
            $('ul.messages').css({'height':'calc(100% - 47px)'});
            $('.typing').css({'display':'none'});
        }
        fastScroll();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handeling Closing chat

    var closeChat = false; // Variable to keep track of whether this user has closed the chat on their end

    function closeChat() {
        // code to be excecuted when it is time for the chat to close
        var input;
        input = {'system': system, 'room': room};
        socket.emit('close Chat', input);
    }

    $("#closeChat").click(function(){
        // The user has clicked the close chat button at the bottom
        var input;
        $('.useractionpopup').css({"display":"none", "opacity":"0"});
        $('#closeChatSection').css({'display':'none'});
        closeChat = true;
        $('.messages').append('<li><strong>Your partner has been alerted of your desire to close the chat</strong></li>');
        input = {'room': room, 'user': userid};
        socket.emit('close attempt', input);
        fastScroll();
    });

    socket.on('attempt close', function(output) {
        // input = {'room': user.chat_room, 'user': user.id};
        var input;
        if ( (output['user'] != userid) && closeChat) { // they want it closed and we closed it already
            input = {'system': system, 'room': room};
            socket.emit('close Chat', input);
        } else if (output['user'] != userid) {
            $('.messages').append('<li class="otheruser"><strong>Your partner wishes to close the chat, close click the close chat button at the bottom center of the page to close it if you are both done</strong></li>');
            fastScroll();
        }
    });

    // chat is closed
    socket.on('chat closed', function(output) {
        // output = {"redirect": redirect, "room": input['room']}; This is for the admin
        $('#closeChatSection').css({'display':'none'});
        $('#m').prop("readonly", true);
        $('#m').val('');
        $('#timer').html('Chat closed');
        window.location.href = output['redirect'];
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keep track of the timer
    // max time in minutes
    var warningTime = 5 * 60;
    var warningGiven = false;

    function updateTimer(){
        var time, currentTime, timeSince, timeLeft;
        currentTime = getCurrentTime();
        // get time remaining in seconds
        timeSince = (Number(currentTime) - Number(startTime))
        timeLeft = Math.floor((Number(timeRemaining) - timeSince)/1000)
        // detemine whether we need to give the warning
        if (0 < timeLeft && timeLeft <= warningTime && !warningGiven){
            warningGiven = true;
            giveWarning();
        }
        // determine whether chat time has run up and we need to close it
        if (timeLeft <= 0){
            $('#closeChatSection').css({'display':'none'});
            $('#planSubmit').css({'display':'block'});
            $('#planSubmit').animate({'opacity':'1'}, 'slow');
            $('#m').prop("readonly", true);
            $('#m').val('');
            $('#timer').html('Chat closed');
            closeChat();
            clearInterval(keepTime);
            return;
        }
        editTimer(timeLeft);
    }

    function editTimer(timeLeft) {
        var secLeft, minLeft, timeLeft;
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


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keeping track of the other user is typing notification
    isTyping = false;
    function checkTyping(){
        var input;
        message = $('#m').val();
        if (message.length > 0) { // user typing
            isTyping = true;
            input = {'room': room, 'name': name, 'id':userid, 'message': message};
            socket.emit('user typing', input);
        } else if(isTyping && message.length === 0) { // user no longer typing
            isTyping = false;
            input = {'room': room, 'name': name, 'id': userid, 'message': message};
            socket.emit('user typing', input);
        }
    }

    var typingmodified = false; // Determine whether we have set the text for .typing yet
    var wasTyping = false;
    socket.on('typing alert', function(output) {
        // form of output is output = {'id':input['id'], name: input['name'], message: input['message'], 'room':input['room']};
        var shouldScroll;
        if (output['id'] != userid) { // we must be getting an alert about the other user typing
            if (output['message'].length === 0 && wasTyping) { // They are no longer typing
                wasTyping = false;
                shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
                $('ul.messages').css({'height':'calc(100% - 47px)'});
                $('.typing').css({'display':'none'});
                if (shouldScroll) {
                    fastScroll();
                }
            } else if(output['message'].length > 0 && !wasTyping) { // They are now typing
                if (!typingmodified){
                    // We need to set the text for .typing with the other user's name and a message like " is typing . . ."
                    typingmodified = true;
                    othertyping = output['name'] + " is typing. . ."
                    $('.typing').text(othertyping);
                }
                wasTyping = true; // Keep track that we had this notification displayed, so we hide it later upon
                                  // receiving a message fromt the other user
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















