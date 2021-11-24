/**
 * creates horizontally placed cards carousel
 * @param {Array} cardsData json array
 */
function createCardsCarousel(cardsData) {
    let cards = "";
    cardsData.map((card_item) => {
        const item = `<div class="carousel_cards in-left">
    <img draggable="false" class="cardBackgroundImage" src=${card_item.image}>
    <div class="cardFooter"> <span class="cardTitle" title="abc">${card_item.title}</span>
    <div class="cardDescription"></div></div></div>`;
        cards += item;
    });
    const cardContents = `<div id="paginated_cards" class="cards"> <div onscroll="checkArrows()" class="cards_scroller">${cards} <img draggable="false" src="./static/img/icons/arrow.svg" class="arrow prev"> <img draggable="false" src="./static/img/icons/arrow.svg" class="arrow next"> </div> </div>`;
    return cardContents;
}

/**
 * appends cards carousel on to the chat screen
 * @param {Array} cardsToAdd json array
 */
function showCardsCarousel(cardsToAdd) {
    const cards = createCardsCarousel(cardsToAdd);

    $(cards).appendTo(".chats").show();

    if (cardsToAdd.length <= 2) {
        $(`.cards_scroller>div.carousel_cards:nth-of-type(2)`).fadeIn(0);
    } else {
        for (let i = 0; i < cardsToAdd.length; i += 1) {
            $(`.cards_scroller>div.carousel_cards:nth-of-type(${i})`).fadeIn(0);
        }
        //$(".cards .arrow.prev").fadeIn("3000");
        $(".cards .arrow.next").fadeIn("0");
    }

    const card = document.querySelector("#paginated_cards");
    const card_scroller = card.querySelector(".cards_scroller");
    const cardsNum = document.getElementsByClassName("carousel_cards").length;
    const card_item_size = (card_scroller.scrollWidth / cardsNum)/1.5;

    /**
     * For paginated scrolling, simply scroll the card one item in the given
     * direction and let css scroll snaping handle the specific alignment.
     */
    function scrollToNextPage() {
        card_scroller.scrollBy(card_item_size, 0);
    }

    function scrollToPrevPage() {
        card_scroller.scrollBy(-card_item_size, 0);
    }

    card.querySelector(".arrow.next").addEventListener("click", scrollToNextPage);
    card.querySelector(".arrow.prev").addEventListener("click", scrollToPrevPage);
    $(".usrInput").focus();
}

function checkArrows(){
    const card = document.querySelector("#paginated_cards");
    const card_scroller = card.querySelector(".cards_scroller");

    if (card_scroller.scrollLeft != 0){
        $(".cards .arrow.prev").fadeIn("3000")
    }else{
        $(".cards .arrow.prev").fadeOut("3000")
    }

    if ((card_scroller.scrollWidth -card_scroller.offsetWidth) == card_scroller.scrollLeft){
        $(".cards .arrow.next").fadeOut("3000");
    }else{
        $(".cards .arrow.next").fadeIn("3000");
    }
}