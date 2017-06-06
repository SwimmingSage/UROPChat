$(document).ready(function() {
    $(".joinchat button").click(function(){
        // I'm also gonna want to make a backend call here to initialize creating a chat room, but not gonna make one quite
        // yet I think as I dont' want to make chat room objects unless I have both users
        $('.joinchat button').css({"display":"none", "opacity": "0"});
        $('.joinchat p').css({"display":"block", "opacity": "0"});
        $('.joinchat p').animate({'opacity':'0.97'}, 'slow');
    })
});