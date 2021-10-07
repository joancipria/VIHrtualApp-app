
/**
 * removes the bot typing indicator from the chat screen
 */
function hideBotTyping() {
    // $("#botAvatar").remove();
    // $(".botTyping").remove();
    document.getElementById("bot_status").innerHTML = "en línea";

}

/**
 * adds the bot typing indicator from the chat screen
 */
function showBotTyping() {
    // const botTyping = '<img class="botAvatar" id="botAvatar" src="./static/img/sara_avatar.png"/><div class="botTyping"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
    // $(botTyping).appendTo(".chats");
    // $(".botTyping").show();
    document.getElementById("bot_status").innerHTML = "escribiendo ...";
    scrollToBottomOfResults();
}
