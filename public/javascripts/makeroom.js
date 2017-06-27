$(document).ready(function() {

    $("#chatcreate").click(function(){
        $.ajax({
            url: '/makeChat',
            data: {
            },
            type: 'GET',
            success: function(data) {
                // in this case data is the chatrooms id
                newRoom = '<div class="archivechatboxes">' +
                            '<div class="upperarchive" id=' + data + '>' +
                              '<h1>Chat ' + data +'</h1>' +
                              '<span><button>Assign</button></span>' +
                            '</div>' +
                          '</div>'
                $(".admin").append(newRoom);
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    })

    // $(document).on("click", ".lowerul li", function() {
    //     $(".lowerul").css({"display":"none", "opacity":"0"});
    //     newtext = $(this).text();
    //     // console.log(newtext);
    //     element = $(this).parent("ul").siblings("button").children("span");
    //     element.text(newtext);
    // });

    // Handle the count tracker
    // socket.emit('in prep');

    // socket.on('userchange', function(output) {
    //     // output = {'prepCount': prepCount, 'readyCount': readyCount};
    //     $('#prepspan').text(output.prepCount);
    //     $('#readyspan').text(output.readyCount);
    // });

});