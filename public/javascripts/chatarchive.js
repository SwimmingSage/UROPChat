$(document).ready(function() {

    $('.upperarchive').click( function() {
        id = this.id;
        dingbat = $(this).children('span');


        if ($('#chat' + id).css('display') === 'none') {
            $('#chat' + id).show(500);
            dingbat.html('&#10134');
        } else {
            $('#chat' + id).hide(500);
            dingbat.html('&#10133');
        }
    })

});


