$(document).ready(function() {

    $('#consentsigned').click( function(){
        $("#agreeconsent").css({"display":"none", "opacity":"0"});
        if ($("#consentcheck").is(":checked")) {
            window.location.href = "/loginhome";
        } else {
            $("#agreeconsent").css({"display":"block"});
            $("#agreeconsent").animate({"opacity":"1"},400);
        }
    });


});