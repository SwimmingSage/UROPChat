$(document).ready(function() {

    // This grabs the user data from backend so we can get their info
    var user;
    var chatroom;
    $.ajax({
        url: '/getUserSubmit',
        data: {
        },
        type: 'GET',
        success: function(data) {
            user = data;
            chatroom = user.chat_room;
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Coding for Submissions

    stepnumber = 1;

    $("#addAction").click(function() {
        stepnumber += 1;
        newAction = '<ul class="upperul" id="step'+ stepnumber+'">'
                        + '<li class="upperli"><strong>' + stepnumber + '.</strong></li>'
                        + '<li class="upperli"><button><span id="action' + stepnumber + '">Action</span> <div class="downarrow">&#10095</div></button>'
                            + '<ul class="lowerul">'
                                + '<li class="goto">Go to</li>'
                                + '<li class="package">Drop Package</li>'
                                + '<li class="surveil">Surveil</li>'
                                + '<li class="intercept">Intercept</li>'
                            + '</ul>'
                        + '</li>'
                        + '<li class="upperli"><button><span id="location' + stepnumber + '">Location</span><div class="downarrow">&#10095</div></button>'
                            + '<ul class="lowerul">'
                                + '<li class="mb">Main Base</li>'
                                + '<li class="pc">Package Center</li>'
                                + '<li class="p1">P1</li>'
                                + '<li class="p2">P2</li>'
                                + '<li class="p3">P3</li>'
                                + '<li class="p4">P4</li>'
                                + '<li class="r1">Region1</li>'
                                + '<li class="r2">Region2</li>'
                                + '<li class="uav1">UAV1</li>'
                                + '<li class="uav2">UAV2</li>'
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
        // console.log("We clicked it");
        // $(".lowerul").css({"display":"none", "opacity":"0"});
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
        $(".lowerul").css({"display":"none", "opacity":"0"});
        newtext = $(this).text();
        // console.log(newtext);
        element = $(this).parent("ul").siblings("button").children("span");
        element.text(newtext);
    });


    $("#submitplan").click(function() {
        plans = []
        for (i=1; i <= stepnumber; i++) {
            newobj = {'stepnumber': i};
            newobj['action'] = $("#action" + i).text();
            newobj['location'] = $("#location" + i).text();
            plans.push(newobj)
        }
        console.log(plans)
        $.ajax({
            url: '/addPlan',
            data: {
                plan: JSON.stringify(plans),
            },
            type: 'POST',
            success: function(data) {
                if (data === "success") {
                    $(".messageBottom").css({"display":"none", "opacity":"0"});
                    $("#beginSurvey").css({"display":"block"});
                    $("#beginSurvey").animate({"opacity":"1"}, "slow");
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    });


});



















