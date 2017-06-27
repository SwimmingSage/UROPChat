$(document).ready(function() {

    $("#chatcreate").click(function(){
        $.ajax({
            url: '/makeChat',
            data: {
            },
            type: 'GET',
            success: function(data) {
                // in this case data is the chatrooms id
                newRoom = '<div class="chatrooms">' +
                            '<div class="chatroomdiv" id=' + data + '>' +
                              '<h1>Chat: ' + data +'</h1>' +
                              '<div class="selectroom">' +
                                '<button>Assign</button>' +
                                '<p class="assigned">Assigned</p>' +
                              '</div>' +
                            '</div>' +
                          '</div>'
                $(".admin").append(newRoom);
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    })

    $(document).on("click", ".selectroom button", function() {
        chatID = $(this).parent("div").parent("div").attr('id');
        console.log("chatID came out to be", chatID);
        $(this).css({"display":"none"});
        // Now to make the backend call if this is correct
        $.ajax({
            url: '/makeUnavailable',
            data: {
                chat: chatID,
            },
            type: 'POST',
            success: function(data) {
                if (data === "success") {
                    $("#" + chatID + " div p").css({"display": "block"});
                    $("#" + chatID + " div p").animate({"opacity": "1"}, 400);
                    console.log("This was a success");
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    });

    // Handle the count tracker
    // socket.emit('in prep');

    // socket.on('userchange', function(output) {
    //     // output = {'prepCount': prepCount, 'readyCount': readyCount};
    //     $('#prepspan').text(output.prepCount);
    //     $('#readyspan').text(output.readyCount);
    // });

});