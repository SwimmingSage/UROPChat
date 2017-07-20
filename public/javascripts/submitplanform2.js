$(document).ready(function() {

    $("#submitplan").click(function() {
        sendPlan();
    });

    function sendPlan() { // submits the user's plan to the backend
        var plans, input;
        plans = gatherPlans(); // should return a list of the plans objects
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

    function gatherPlans() {
        var plans = [];
        plans = plans.concat(getBlockPlan(block1Count, "block1"));
        plans = plans.concat(getBlockPlan(block2Count, "block2"));
        plans = plans.concat(getBlockPlan(block3Count, "block3"));
        plans = plans.concat(getBlockPlan(block4Count, "block4"));
        plans = plans.concat(getBlockPlan(block5Count, "block5"));
        return plans;
    }

    function getBlockPlan(counter, divID) {
        var targetMissile;
        if (divID === "block1") {
            targetMissile = "A (Moth)"
        } else if (divID === "block2") {
            targetMissile = "B (Hungry)"
        } else if (divID === "block3") {
            targetMissile = "C (Hungry)"
        } else if (divID === "block4") {
            targetMissile = "D (Green)"
        } else {
            targetMissile = "E (Eagle)"
        }
        var returnPlans = []
        for (i=1; i <= counter; i++) {
            var count = $("#" + divID + "act" + i + " .count span").text();
            var missile = $("#" + divID + "act" + i + " .missile span").text();
            if (count === "" || count === "Number" || missile === "" || missile === "Missile Type") {
                continue;
            }
            newobj = {target: targetMissile};
            newobj['count'] = count;
            newobj['missile'] = missile;
            returnPlans.push(newobj);
        }
        return returnPlans;
    }

    var block1Count = 1;
    var block2Count = 1;
    var block3Count = 1;
    var block4Count = 1;
    var block5Count = 1;

    function addAction(counter, targetID) {
        var newAction;
        newAction = '<ul class="upperul" id="' + targetID + 'act' + counter + '">'
                        + '<li class="upperli missile"><button><span>Missile Type</span> <div class="downarrow">&#10095;</div></button>'
                            + '<ul class="lowerul onecolumn">'
                                + '<li>Floating Decoy</li>'
                                + '<li>Flare (infrared)</li>'
                                + '<li>Chaff (radar)</li>'
                                + '<li>Laser Shot</li>'
                            + '</ul>'
                        + '<li class="upperli count"><button><span>Number</span><div class="downarrow">&#10095;</div></button>'
                            + '<ul class="lowerul">'
                                + '<li class="leftcol">1</li>'
                                + '<li class="leftcol">2</li>'
                                + '<li class="leftcol">3</li>'
                                + '<li class="rightcol">4</li>'
                                + '<li class="rightcol">5</li>'
                                + '<li class="rightcol">6</li>'
                            + '</ul>'
                    + '</ul>';
        $('#' + targetID + " .planSubmission").append(newAction);
    }

    $(".addActionSub").click(function() {
        var parentDivID, sectionNumber;
        parentDivID = $(this).parent("div").parent("div").attr('id'); // "block1", "block2", etc.
        sectionNumber = parentDivID[5];
        switch (sectionNumber) {
            case "1":
                block1Count += 1;
                addAction(block1Count, parentDivID);
                break;
            case "2":
                block2Count += 1;
                addAction(block2Count, parentDivID);
                break;
            case "3":
                block3Count += 1;
                addAction(block3Count, parentDivID);
                break;
            case "4":
                block4Count += 1;
                addAction(block4Count, parentDivID);
                break;
            case "5":
                block5Count += 1;
                addAction(block5Count, parentDivID);
                break;
            default:
                console.log("Something went wrong. . .");
        }
    });

    function removeAction(counter, targetID) {
        if (counter > 1) {
            $("#" + targetID + "act" + counter).remove();
            return true
        }
        return false
    }

    $(".removeActionSub").click(function() {
        parentDivID = $(this).parent("div").parent("div").attr('id'); // "block1", "block2", etc.
        sectionNumber = parentDivID[5];
        switch (sectionNumber) {
            case "1":
                if (removeAction(block1Count, parentDivID)) {
                    block1Count -= 1;
                }
                break;
            case "2":
                if (removeAction(block2Count, parentDivID)){
                    block2Count -= 1;
                }
                break;
            case "3":
                if (removeAction(block3Count, parentDivID)) {
                    block3Count -= 1;
                }
                break;
            case "4":
                if (removeAction(block4Count, parentDivID)) {
                    block4Count -= 1;
                }
                break;
            case "5":
                if (removeAction(block5Count, parentDivID)) {
                    block5Count -= 1;
                }
                break;
            default:
                console.log("Something went wrong. . .");
        }
    });

    // This is for handling the drop down menus and reassigning the text of the button after that
    $(document).on("click", ".upperul li button", function() {
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
        element = $(this).parent("ul").siblings("button").children("span");
        element.text(newtext);
    });


});












