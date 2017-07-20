$(document).ready(function() {

  $("#signup").click(function(){
    //get values in input boxes
    var rawusername = $("#inputusername").val();
    var username = rawusername.toLowerCase();
    var password = $("#inputpassword").val();
    var reenterpassword = $("#inputrepassword").val();
    $('li.error').css({"display":"none"});

    if(username.length === 0 || password.length === 0 || reenterpassword.length === 0){
        $("#fillallsections1").show();
        return;
    }
    if(password != reenterpassword) {
        $("#notmatchingpassword").show();
        $("#inputpassword").val("");
        $("#inputrepassword").val("");
        return;
    }

    $.ajax({
      url: '/signup',
      data: {
        username: username,
        password: password,
        reenterpassword: reenterpassword,
      },
      type: 'POST',
      success: function(data) {
        //$('where I want to put data').text(data);
        if(data === "loggedin"){
          $.ajax({
            url: '/login',
            data: {
              username: username,
              password: password,
            },
            type: 'POST',
            success: function(data) {
              if(data === "loggedin")
                window.location.href = "/admin";
            },
            error: function(xhr, status, error) {
              console.log("Uh oh there was an error: " + error);
            }
          })
        }
        if(data === "usernameTaken"){
          $("#usernameinuse").show();
          $("#inputusername").val('');
        }
      },
      error: function(xhr, status, error) {
        console.log("Uh oh there was an error: " + error);
      }
    })
  });

  $("#login").click(function(){
    //get values in input boxes
    var rawusername = $("#inputusernamelogin").val();
    var username = rawusername.toLowerCase();
    var passwordlogin = $("#inputpasswordlogin").val();
    $('li.error').css({"display":"none"});
    //have to check if combo is valid or not
    if(username.length === 0 || passwordlogin.length === 0){
      $("#fillallsections2").show();
      return;
    }

    $.ajax({
      url: '/login',
      data: {
        username: username,
        password: passwordlogin,
      },
      type: 'POST',
      success: function(data) {
        if(data === "loggedin") {
          window.location.href = "/admin";
        }
      },
      error: function(xhr, status, error) {
        $("#invalidusernamepassword").show();
      }
    })
  });


});