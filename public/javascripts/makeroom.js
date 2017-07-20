$(document).ready(function() {

    $("#chatcreate").click(function(){
        var newRoom;
        $.ajax({
            url: '/makeChat',
            data: {
            },
            type: 'GET',
            success: function(chatsystem) {
                // in this case data is the chatrooms id
                newRoom = '<div class="chatrooms">' +
                            '<div class="chatroomdiv" id=' + chatsystem.id + '>' +
                              '<h1>Chat: ' + chatsystem.id +'</h1>' +
                              '<p>User1 ID: ' + chatsystem.User1 + '</p>' +
                              '<p>User2 ID: ' + chatsystem.User2 + '</p>' +
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
        var chatID;
        chatID = $(this).parent("div").parent("div").attr('id');
        $(this).css({"display":"none"});
        // Now to make the backend call if this is correct
        $.ajax({
            url: '/makeUnavailable',
            data: {
                chatsystem: chatID,
            },
            type: 'POST',
            success: function(data) {
                if (data === "success") {
                    $("#" + chatID + " div p").css({"display": "block"});
                    $("#" + chatID + " div p").animate({"opacity": "1"}, 400);
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    });

});