// Detect device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * scroll to the bottom of the chats after new message has been added to chat
 */

// Select the node that will be observed for mutations
const targetNode = document.getElementById('chats');

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            //console.log('A child node has been added or removed.');
            scrollToBottomOfResults();
        }
        else if (mutation.type === 'attributes') {
            //console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

function scrollToBottomOfResults() {
    const terminalResultsDiv = document.getElementById("chats");
    terminalResultsDiv.scrollTo(0, terminalResultsDiv.scrollHeight);
}

// Scroll to bottom on window resize (mobile keyboard)
window.addEventListener('resize', function (event) {
    scrollToBottomOfResults();
}, true);


/**
 * Set user response on the chat screen
 * @param {String} message user message
 */
function setUserResponse(message) {
    let date = new Date();
    let dateString = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    //const user_response = `<img class="userAvatar" src='./static/img/userAvatar.jpg'><p class="userMsg">${message} </p><div class="clearfix"></div>`;
    const user_response = `<p class="userMsg">${message} <span class="time">${dateString}</span></p><div class="clearfix"></div>`;
    $(user_response).appendTo(".chats").show("slow");

    $(".usrInput").val("");
    showBotTyping();
    $(".suggestions").remove();
}

/**
 * renders bot response on to the chat screen
 * @param {Array} response json array containing different types of bot response
 *
 * for more info: `https://rasa.com/docs/rasa/connectors/your-own-website#request-and-response-format`
 */
function setBotResponse(response, status) {
    let date = new Date();
    let dateString = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    // renders bot response after 500 milliseconds
    setTimeout(() => {
        //hideBotTyping();
        if (response.length < 1 && status !== "success") {
            // if there is no response from Rasa, send  fallback message to the user
            const fallbackMsg = "Vaya, parece que he tenido un problema 😅. Inténtalo de nuevo más tarde.";

            //const BotResponse = `<img class="botAvatar" src="./static/img/sara_avatar.png"/><p class="botMsg">${fallbackMsg}</p><div class="clearfix"></div>`;
            const BotResponse = `<p class="botMsg">${fallbackMsg}<span class="time">${dateString}</span></p><div class="clearfix"></div>`;

            renderResponse(BotResponse);
        } else {
            let nextDelay = 0;
            let delay = 0;
            // if we get response from Rasa
            for (let i = 0; i < response.length; i += 1) {
                let last = i==response.length-1;
                if (isMobile) {
                    delay += (i * (delay_between_messages * 1000)) + nextDelay;

                    if (response[i].text) {
                        nextDelay = response[i].text.length * 30;
                    }
                } else {
                    delay = i * (delay_between_messages * 1000);
                }

                // check if the response contains "text"
                if (Object.hasOwnProperty.call(response[i], "text")) {
                    if (response[i].text != null) {
                        response[i].text = customizeBot(response[i].text);
                        //const BotResponse = `<img class="botAvatar" src="./static/img/sara_avatar.png"/><p class="botMsg">${response[i].text.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p><div class="clearfix"></div>`;
                        const BotResponse = `<p class="botMsg">${response[i].text.replace(/(?:\r\n|\r|\n)/g, '<br>')}<span class="time">${dateString}</span></p><div class="clearfix"></div>`;
                        renderResponse(BotResponse, delay, last);
                    }
                }

                // check if the response contains "images"
                if (Object.hasOwnProperty.call(response[i], "image")) {
                    if (response[i].image !== null) {
                        const BotResponse = `<div class="singleCard"><img class="imgcard" src="${response[i].image}"></div><div class="clearfix">`;
                        renderResponse(BotResponse, delay, last);
                    }
                }

                // check if the response contains "buttons"
                if (Object.hasOwnProperty.call(response[i], "buttons")) {
                    if (response[i].buttons.length > 0) {
                        addSuggestion(response[i].buttons, delay);
                    }
                }

                // check if the response contains "attachment"
                if (Object.hasOwnProperty.call(response[i], "attachment")) {
                    if (response[i].attachment != null) {
                        if (response[i].attachment.type === "video") {
                            // check if the attachment type is "video"
                            const video_url = response[i].attachment.payload.src;

                            const BotResponse = `<div class="video-container"> <iframe src="${video_url}" frameborder="0" allowfullscreen></iframe> </div>`;
                            renderResponse(BotResponse, delay, last);
                        }
                    }
                }
                // check if the response contains "custom" message
                if (Object.hasOwnProperty.call(response[i], "custom")) {
                    const { payload } = response[i].custom;
                    if (payload === "quickReplies") {
                        // check if the custom payload type is "quickReplies"
                        const quickRepliesData = response[i].custom.data;
                        showQuickReplies(quickRepliesData);
                        return;
                    }

                    // check if the custom payload type is "pdf_attachment"
                    if (payload === "pdf_attachment") {
                        renderPdfAttachment(response[i], delay);
                        return;
                    }

                    // check if the custom payload type is "dropDown"
                    if (payload === "dropDown") {
                        const dropDownData = response[i].custom.data;
                        renderDropDwon(dropDownData);
                        return;
                    }

                    // check if the custom payload type is "location"
                    if (payload === "location") {
                        $("#userInput").prop("disabled", true);
                        getLocation();
                        return;
                    }

                    // check if the custom payload type is "cardsCarousel"
                    if (payload === "cardsCarousel") {
                        const restaurantsData = response[i].custom.data;
                        setTimeout(() => {
                            showCardsCarousel(restaurantsData);
                        },
                            delay // Delay bewteen messages
                        );
                        //return;
                    }

                    // check if the custom payload type is "chart"
                    if (payload === "chart") {
                        /**
                         * sample format of the charts data:
                         *  var chartData =  { "title": "Leaves", "labels": ["Sick Leave", "Casual Leave", "Earned Leave", "Flexi Leave"], "backgroundColor": ["#36a2eb", "#ffcd56", "#ff6384", "#009688", "#c45850"], "chartsData": [5, 10, 22, 3], "chartType": "pie", "displayLegend": "true" }
                         */

                        const chartData = response[i].custom.data;
                        const {
                            title,
                            labels,
                            backgroundColor,
                            chartsData,
                            chartType,
                            displayLegend,
                        } = chartData;

                        // pass the above variable to createChart function
                        createChart(
                            title,
                            labels,
                            backgroundColor,
                            chartsData,
                            chartType,
                            displayLegend,
                        );

                        // on click of expand button, render the chart in the charts modal
                        $(document).on("click", "#expand", () => {
                            createChartinModal(
                                title,
                                labels,
                                backgroundColor,
                                chartsData,
                                chartType,
                                displayLegend,
                            );
                        });
                        return;
                    }

                    // check of the custom payload type is "collapsible"
                    if (payload === "collapsible") {
                        const { data } = response[i].custom;
                        // pass the data variable to createCollapsible function
                        createCollapsible(data);
                    }
                }
            }
        }
        $(".usrInput").focus();
    }, 500);

}

/**
 * sends the user message to the rasa server,
 * @param {String} message user message
 */
function send(message) {
    $("#userInput").prop("disabled", true);
    $.ajax({
        url: rasa_server_url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ message, sender: sender_id }),
        success(botResponse, status) {
            //console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);

            // Split button messages
            if (botResponse.length != 0) {
                if (botResponse[0].buttons && botResponse[0].text.split("\n\n").length !== 0) {
                    botResponse = splitMessages(botResponse);
                }
            }


            // if user wants to restart the chat and clear the existing chat contents
            if (message.toLowerCase() === "/restart") {
                $("#userInput").prop("disabled", false);

                // if you want the bot to start the conversation after restart
                // customActionTrigger();
                return;
            }
            setBotResponse(botResponse, status);
        },
        error(xhr, textStatus) {
            if (message.toLowerCase() === "/restart") {
                $("#userInput").prop("disabled", false);
                // if you want the bot to start the conversation after the restart action.
                // actionTrigger();
                // return;
            }

            // if there is no response from rasa server, set error bot response
            setBotResponse("");
            console.log("Error from bot end: ", textStatus);
        },
    });
}
/**
 * sends an event to the bot,
 *  so that bot can start the conversation by greeting the user
 *
 * `Note: this method will only work in Rasa 1.x`
 */
/* eslint-disable-next-line no-unused-vars
function actionTrigger() {
    $.ajax({
        url: `http://vihrtualapp.gti-ia.upv.es/api/actions/conversations/${sender_id}/execute`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            name: action_name,
            policy: "MappingPolicy",
            confidence: "0.98",
        }),
        success(botResponse, status) {
            console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);

            if (Object.hasOwnProperty.call(botResponse, "messages")) {
                setBotResponse(botResponse.messages);
            }
            $("#userInput").prop("disabled", false);
        },
        error(xhr, textStatus) {
            // if there is no response from rasa server
            setBotResponse("");
            console.log("Error from bot end: ", textStatus);
            $("#userInput").prop("disabled", false);
        },
    });
}*/

/**
 * sends an event to the custom action server,
 *  so that bot can start the conversation by greeting the user
 *
 * Make sure you run action server using the command
 * `rasa run actions --cors "*"`
 *
 * `Note: this method will only work in Rasa 2.x`
 */
// eslint-disable-next-line no-unused-vars
function customActionTrigger() {
    $.ajax({
        url: action_server_url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            next_action: action_name,
            tracker: {
                sender_id,
            },
        }),
        success(botResponse, status) {
            //console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);

            if (Object.hasOwnProperty.call(botResponse, "responses")) {
                setBotResponse(botResponse.responses);
            }
            $("#userInput").prop("disabled", false);
        },
        error(xhr, textStatus) {
            // if there is no response from rasa server
            setBotResponse("");
            console.log("Error from bot end: ", textStatus);
            $("#userInput").prop("disabled", false);
        },
    });
}



/**
 * clears the conversation from the chat screen
 * & sends the `/resart` event to the Rasa server
 */
function restartConversation() {
    $("#userInput").prop("disabled", true);
    // destroy the existing chart
    $(".collapsible").remove();

    if (typeof chatChart !== "undefined") {
        chatChart.destroy();
    }

    $(".chart-container").remove();
    if (typeof modalChart !== "undefined") {
        modalChart.destroy();
    }
    $(".chats").html("");
    $(".usrInput").val("");
    send("/restart");
}
// // triggers restartConversation function.
// $("#restart").click(() => {
//     restartConversation();
// });

/**
 * if user hits enter or send button
 * */
$(".usrInput").on("keyup keypress", (e) => {
    const keyCode = e.keyCode || e.which;

    const text = $(".usrInput").val();
    if (keyCode === 13) {
        if (text === "" || $.trim(text) === "") {
            e.preventDefault();
            return false;
        }
        // destroy the existing chart, if yu are not using charts, then comment the below lines
        $(".collapsible").remove();
        $(".dropDownMsg").remove();
        if (typeof chatChart !== "undefined") {
            chatChart.destroy();
        }

        $(".chart-container").remove();
        if (typeof modalChart !== "undefined") {
            modalChart.destroy();
        }

        //$("#paginated_cards").remove();
        $(".suggestions").remove();
        $(".quickReplies").remove();
        //$(".usrInput").blur();
        setUserResponse(text);
        send(text);
        e.preventDefault();
        return false;
    }
    return true;
});

$("#sendButton").on("click", (e) => {
    const text = $(".usrInput").val();
    if (text === "" || $.trim(text) === "") {
        e.preventDefault();
        return false;
    }
    // destroy the existing chart
    if (typeof chatChart !== "undefined") {
        chatChart.destroy();
    }

    $(".chart-container").remove();
    if (typeof modalChart !== "undefined") {
        modalChart.destroy();
    }

    $(".suggestions").remove();
    $("#paginated_cards").remove();
    $(".quickReplies").remove();
    //$(".usrInput").blur();
    $(".dropDownMsg").remove();
    setUserResponse(text);
    send(text);
    e.preventDefault();
    return false;
});


function customizeBot(message) {
    // Replace name
    message = message.replace("Juan", avatars.active.name);

    // Strings to replace
    let messagesToReplace = [{ male: "ncantado", female: "ncantada" }];

    // Replace male strings
    if (avatars.active.name == avatars.female.name) {
        messagesToReplace.forEach(string => {
            message = message.replace(string.male, string.female);
        });
    }

    return message;
}

// Renders response with animation and delay between messages
function renderResponse(response, delay = 0, last = false) {
    setTimeout(() => {
        showBotTyping();
    }, delay * 0.5);

    setTimeout(() => {
        // Render response with fade in animation
        $(response).appendTo(".chats").hide().fadeIn(fade_duration_messages * 1000);
        hideBotTyping();
        // Update image viewer to detect new images
        viewer.update();

        if (last) {
            $("#userInput").prop("disabled", false);
            $(".usrInput").focus();
        }

        // Scroll to bottom
        //setTimeout(() => {scrollToBottomOfResults()},100);
    },
        delay // Delay bewteen messages
    );
}

// Split messages
function splitMessages(botResponse) {

    for (let i = 0; i < botResponse.length; i++) {
        // If response has text 
        if (botResponse[i].text) {

            // Check if contains break line
            let splitText = botResponse[i].text.split("\n\n");
            if (splitText.length >= 2) {
                // Then split in 2 messages
                botResponse[i].text = splitText[splitText.length - 1];

                botResponse.splice(i, 0, {
                    recipient_id: botResponse[i].recipient_id,
                    text: splitText[0]
                });
            }
        }

    }
    return botResponse;
}

function clearChat() {
    document.getElementById("chats").innerHTML = "";
}