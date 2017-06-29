$(document).ready(function() {

    // This grabs the user data from backend so we can get their info
    var name;
    var room;
    var userid;

    if (document.cookie != "") {
        userid = Cookies.get('userid');
        name = Cookies.get('name');
        room = Cookies.get('room');
    } else {
        window.location.href = "/loginhome";
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Coding for Submissions

    stepnumber = 1;

    $("#addAction").click(function() {
        stepnumber += 1;
        newAction = '<ul class="upperul" id="step'+ stepnumber+'">'
                        + '<li class="upperli"><strong>' + stepnumber + '.</strong></li>'
                        + '<li class="upperli"><button><span id="action' + stepnumber + '">Action</span> <div class="downarrow">&#10095</div></button>'
                            + '<ul class="lowerul">'
                                + '<li class="goto leftcol">Go to</li>'
                                + '<li class="package leftcol">Drop Package</li>'
                                + '<li class="surveil rightcol">Surveil</li>'
                                + '<li class="intercept rightcol">Intercept</li>'
                            + '</ul>'
                        + '</li>'
                        + '<li class="upperli"><button><span id="location' + stepnumber + '">Location</span><div class="downarrow">&#10095</div></button>'
                            + '<ul class="lowerul">'
                                + '<li class="mb leftcol">Main Base</li>'
                                + '<li class="pc leftcol">Package Center</li>'
                                + '<li class="p1 leftcol">P1</li>'
                                + '<li class="p2 leftcol">P2</li>'
                                + '<li class="p3 leftcol">P3</li>'
                                + '<li class="p4 rightcol">P4</li>'
                                + '<li class="r1 rightcol">Region1</li>'
                                + '<li class="r2 rightcol">Region2</li>'
                                + '<li class="uav1 rightcol">UAV1</li>'
                                + '<li class="uav2 rightcol">UAV2</li>'
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

    removeCookies = function() {
        Cookies.expire('room');
        Cookies.expire('name');
        Cookies.expire('userid');
        console.log("Cookies have been removed");
    }

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
                name: name,
                room: room,
                userid: userid,
            },
            type: 'POST',
            success: function(data) {
                if (data === "success") {
                    // $(".messageBottom").css({"display":"none", "opacity":"0"});
                    $("#submitplan").text("Resubmit Plan");
                    $("#beginSurvey").css({"display":"block"});
                    $("#beginSurvey").animate({"opacity":"1"}, "slow");
                    removeCookies();
                }
            },
            error: function(xhr, status, error) {
                console.log("Uh oh there was an error: " + error);
            }
        });
    });


});



















