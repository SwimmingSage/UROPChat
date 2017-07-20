$(document).ready(function() {

    $("#submitplan").click(function() {
        sendPlan();
    });

    function sendPlan() { // submits the user's plan to the backend
        var newobj, input;
        var plans = []
        for (i=1; i <= stepnumber; i++) {
            newobj = {'stepnumber': i};
            newobj['action'] = $("#action" + i).text();
            newobj['location'] = $("#location" + i).text();
            plans.push(newobj)
        }
        $.ajax({
            url: '/addPlan',
            data: {
                plan: JSON.stringify(plans), // only way to get this list send back and processed correctly
                name: name,
                userid: userid,
                system: system
            },
            type: 'POST',
            success: function(data) {
                if (data === "success") {
                    $("#submitplan").text("Resubmit Plan");
                    $(".proceedWait").css({"display":"block"});
                    $(".proceedWait").animate({"opacity":"1"}, "slow");
                    input = {'system': system, 'user': userid};
                    socket.emit('halfproceed', input);
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    }  

    var stepnumber = 1;

    $("#addAction").click(function() {
        var newAction;
        stepnumber += 1;
        newAction = '<ul class="upperul" id="step'+ stepnumber+'">'
                        + '<li class="upperli"><strong>' + stepnumber + '.</strong></li>'
                        + '<li class="upperli"><button><span id="action' + stepnumber + '">Action</span> <div class="downarrow">&#10095</div></button>'
                            + '<ul class="lowerul">'
                                + '<li class="leftcol">Go to</li>'
                                + '<li class="leftcol">Drop Package</li>'
                                + '<li class="rightcol">Surveil</li>'
                                + '<li class="rightcol">Intercept</li>'
                            + '</ul>'
                        + '</li>'
                        + '<li class="upperli"><button><span id="location' + stepnumber + '">Location</span><div class="downarrow">&#10095</div></button>'
                            + '<ul class="lowerul">'
                                + '<li class="leftcol">Main Base</li>'
                                + '<li class="leftcol">Package Center</li>'
                                + '<li class="leftcol">P1</li>'
                                + '<li class="leftcol">P2</li>'
                                + '<li class="leftcol">P3</li>'
                                + '<li class="rightcol">P4</li>'
                                + '<li class="rightcol">Region1</li>'
                                + '<li class="rightcol">Region2</li>'
                                + '<li class="rightcol">UAV1</li>'
                                + '<li class="rightcol">UAV2</li>'
                            + '</ul>'
                        + '</li>'
                    + '</ul>';
        $('.planSubmission').append(newAction);
    });

    $("#removeAction").click(function() {
        if (stepnumber > 1) {
            $("#step"+stepnumber).remove();
            stepnumber -= 1;
        }
    });

    $(document).on("click", ".upperul li button", function() {
        var element;
        element = $(this).siblings('ul');
        if ($(element).css("display") === 'block' && $(element).css("opacity") === '1') {
            $(".lowerul").css({"display":"none", "opacity":"0"});
        } else {
            $(".lowerul").css({"display":"none", "opacity":"0"});
            $(element).css({"display":"block"});
            $(element).animate({"opacity":"1"}, "slow");
        }
    });

    $(document).on("click", ".lowerul li", function() {
        var newtext, element;
        $(".lowerul").css({"display":"none", "opacity":"0"});
        newtext = $(this).text();
        element = $(this).parent("ul").siblings("button").children("span");
        element.text(newtext);
    });


});














