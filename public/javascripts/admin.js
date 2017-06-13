$(document).ready(function() {

    var socket = io();

    // Send the user to the proper room
    function getToRoom(room) {
        console.log("The room attempted to join is", room);
        socket.emit('multiroom', room);
    }

    var chatrooms;
    var wasTyping = {};
    $.ajax({
        url: '/getAllChat',
        data: {
        },
        type: 'GET',
        success: function(sentchatrooms) {
            chatrooms = sentchatrooms;
            for (i=0; i < sentchatrooms.length; i++) {
                id = sentchatrooms[i].id
                getToRoom(sentchatrooms[i].id);
                wasTyping.id = false;
            }
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }
    });


    function initialScroll(){
        for (i=0; i < chatrooms.length; i++) {
                thisElement = document.getElementById('messages' + chatrooms[i].id);
                fastScroll(thisElement);
        }
    }

    setTimeout(initialScroll, 1000);


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
        // this.id is the id of this element

        // Emit the 'chat message' message with socket.io
        // message = user.firstname + ": " + $('#m').val();
        id = this.id;
        roomid = id.slice(4, id.length);
        message = $('#m' + roomid).val();
        console.log("The message is", message);
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
        // messages.scrollTop = messages.scrollHeight; this is to scroll fast
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
        // <ul class="messages" id="m<%= chats[i].id %>">
        console.log(output);
        thisid = output['room']
        console.log("This id is", thisid);
        messages = document.getElementById('messages' + thisid);
        console.log("Messages is", messages);
        shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);
        if(output['name'] === "Admin"){
            $('#messages' + thisid).append('<li><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        } else {
            $('#messages' + thisid).append('<li class="otheruser"><strong>'+output['name']+':&nbsp;</strong>'+output['message']+'</li>');
        }
        if (shouldScroll) {
            scrollToBottom(thisid, messages);
        }
        if (wasTyping[thisid]){
            wasTyping[thisid] = false;
            $('#messages' + thisid).css({'height':'18em'});
            $('#typing'+output['room']).css({'display':'none'});
            if (shouldScroll){
                fastScroll(messages);
            }
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keep track of the timer
    // max time in minutes
    var maxTime = 20*60 + 5;
    var turnedOff = false;
    function updateTimer(startTime, id){
        time = new Date();
        currentTime = time.getTime();
        // get time remaining in seconds
        remaining = Math.floor(maxTime - ((currentTime - startTime) / 1000));
        // if no time left make it impossible to send more messages, then ideally redirect once we get instructions
        // for what we want to do with them after
        // if (turnedOff) {
        //     return;
        // }
        if (remaining <= 0){
            $('#closeChatSection').css({'display':'none'});
            $('#goHome').css({'display':'block'});
            $('#goHome').animate({'opacity':'1'}, 'slow');
            $('#m'+ id).prop("readonly", true);
            $('#m'+ id).val('');
            $('#timer'+ id).html('0:00');
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
        $('#timer'+ id).text(timeLeft);
    }

    function updateTimes() {
        for (i=0; i < chatrooms.length; i++) {
            updateTimer(chatrooms[i].creationTime, chatrooms[i].id);
        }
    }

    setInterval(updateTimes, 400);

    /////////////////////////////////////////////////////////////////////////////////////////////////////


    socket.on('typing alert', function(output) {
        // form of output is output = {'id':input['id'], name: input['name'], message: input['message'], 'room':input['room']};
        // want to add name to this at some point
        // console.log("Output is", output);
        // console.log("the length of message is", output['message'].length);
        // ignore signs that I am typing
        roomid = output['room'];
        messages = document.getElementById('messages'+roomid);
        shouldScroll = (messages.scrollTop + messages.clientHeight === messages.scrollHeight);

        if (output['message'].length === 0 && wasTyping[roomid]) {
            wasTyping[roomid] = false;
            $('ul#messages'+roomid).css({'height':'18em'});
            $('#typing'+roomid).css({'display':'none'});
        } else if(output['message'].length > 0 && !wasTyping[roomid]) {
            console.log("We recognize the other user is typing");
            wasTyping[roomid] = true;
            $('ul#messages'+roomid).css({'height':'16.6em'});
            $('#typing'+roomid).css({'display':'block'});
        }
        if (shouldScroll) {
            fastScroll(messages);
        }
    });

});
























