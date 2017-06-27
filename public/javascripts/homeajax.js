$(document).ready(function() {

  $("#signup").click(function(){
    //get values in input boxes
    var rawemail = $("#inputemail").val();
    var email = rawemail.toLowerCase();
    console.log("raw email is", rawemail);
    console.log("Non raw email is", email);
    var firstname = $("#inputfirstname").val();
    var lastname = $("#inputlastname").val();
    var password = $("#inputpassword").val();
    var reenterpassword = $("#inputrepassword").val();
    $('li.error').css({"display":"none"});

    if(email.length === 0 || firstname.length === 0 || lastname.length === 0 || password.length === 0 || reenterpassword.length === 0){
        console.log("We have a fillallsections1 error");
        $("#fillallsections1").show();
        return;
    }
    if(password != reenterpassword) {
        $("#notmatchingpassword").show();
        $("#inputpassword").val("");
        $("#inputrepassword").val("");
        return;
    }
    if(!email.includes("@")){
        $("#invalidemail").show();
        $("#inputemail").val("");
        return;
    }

    $.ajax({
      url: '/signup',
      data: {
        email: email,
        firstname: firstname,
        lastname: lastname,
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
              // Passport is looking for a username, but we are using email so I put that in
              username: email,
              password: password,
            },
            type: 'POST',
            success: function(data) {
              if(data === "loggedin")
                // window.location.href = "/loginhome";
                window.location.href = "/intro";
            },
            error: function(xhr, status, error) {
              console.log("Uh oh there was an error: " + error);
            }
          })
        }
        if(data === "emailtaken"){
          $("#emailinuse").show();
          $("#inputemail").val('');
        }
      },
      error: function(xhr, status, error) {
        console.log("Uh oh there was an error: " + error);
      }
    })
  });

  $("#login").click(function(){

    //get values in input boxes
    var rawemaillogin = $("#inputemaillogin").val();
    var emaillogin = rawemaillogin.toLowerCase();
    var passwordlogin = $("#inputpasswordlogin").val();
    console.log("raw email is", rawemaillogin);
    console.log("Non raw emaill is", emaillogin);
    $('li.error').css({"display":"none"});
    //have to check if combo is valid or not
    if(emaillogin.length === 0 || passwordlogin.length === 0){
      $("#fillallsections2").show();
      return;
    }

    $.ajax({
      url: '/login',
      data: {
        // Passport is looking for a username, but we are using email so I put that in
        username: emaillogin,
        password: passwordlogin,
      },
      type: 'POST',
      success: function(data) {
        if(data === "loggedin") {
          window.location.href = "/intro";
        } else if(data === "admin")
          window.location.href = "/admin";
      },
      error: function(xhr, status, error) {
        $("#invalidusernamepassword").show();
      }
    })
  });


});