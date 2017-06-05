$(document).ready(function() {

  $("#signup").click(function(){

    console.log("We got to the javascript");

    //get values in input boxes
    var rawusername = $("#inputusername").val();
    var username = rawusername.toLowerCase();
    var email = $("#inputemail").val();
    var firstname = $("#inputfirstname").val();
    var lastname = $("#inputlastname").val();
    var password = $("#inputpassword").val();
    var reenterpassword = $("#inputrepassword").val();

    //have to check if password = reenterpassword
    //have to check if username is unique
    //have to check if email is unique
    $('li.error').css({"display":"none"});

    if(username.length === 0 || email.length === 0 || firstname.length === 0 || lastname.length === 0 || password.length === 0 || reenterpassword.length === 0){
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
        username: username,
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
              username: username,
              password: password,
            },
            type: 'POST',
            success: function(data) {
              //$('where I want to put data').text(data);
              if(data === "loggedin")
                window.location.href = "/loginhome";
            },
            error: function(xhr, status, error) {
              console.log("Uh oh there was an error: " + error);
              //$("#invalidusernamepassword").show();
            }
          })
        }
        if(data === "usernametaken"){
          $("#usernamenotunique").show();
          $("#inputusername").val('');
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

    // checking to see values of above fields
    //console.log("username: "+ username + " email: "+ email + " firstname: "+ firstname + " lastname: " + lastname + "password: " + password + " reenterpassword:" + reenterpassword);
  });



  $("#login").click(function(){

    //get values in input boxes
    var rawusernamelogin = $("#inputusernamelogin").val();
    var usernamelogin = rawusernamelogin.toLowerCase();
    var passwordlogin = $("#inputpasswordlogin").val();

    //have to check if combo is valid or not

    $('li.error').css({"display":"none"});


    if(usernamelogin.length === 0 || passwordlogin.length === 0){
      $("#fillallsections2").show();
      return;
    }


    $.ajax({
      url: '/login',
      data: {
        username: usernamelogin,
        password: passwordlogin,
      },
      type: 'POST',
      success: function(data) {
        //$('where I want to put data').text(data);
        if(data === "loggedin")
          window.location.href = "/loginhome";
      },
      error: function(xhr, status, error) {
        //console.log("Uh oh there was an error: " + error);
        $("#invalidusernamepassword").show();
      }
    })

    // checking to see values of above fields
    //console.log("username: "+ username + " email: "+ email + " firstname: "+ firstname + " lastname: " + lastname + "password: " + password + " reenterpassword:" + reenterpassword);
  });


});