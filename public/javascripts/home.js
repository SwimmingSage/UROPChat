$(document).ready(function() {

  $('#signuptrigger').click( function(){
    $('li.error').css({"display":"none"});
    $('#loginform').css({"display":"none", "opacity": "0"});
    $('#signupform').css({'display':'block'});
    $('#signupform').animate({'opacity':'0.97'}, 'slow');
  });

  $('#logintrigger').click( function(){
    $('li.error').css({"display":"none"});
    $('#signupform').css({"display":"none", "opacity": "0"});
    $('#loginform').css({'display':'block'});
    $('#loginform').animate({'opacity':'0.97'}, 'slow');
  });


});