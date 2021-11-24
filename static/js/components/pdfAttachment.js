/**
 * renders pdf attachment on to the chat screen
 * @param {Object} pdf_data json object
 */
function renderPdfAttachment(pdf_data, delay = 0) {
    const { url: pdf_url } = pdf_data.custom;
    const { title: pdf_title } = pdf_data.custom;
    const pdf_attachment = `<div class="pdf_attachment"><div class="row"><div style="flex: 2" class="col pdf_icon">
<img src="./static/img/icons/pdf.svg"></div><div style="flex: 9" class="col pdf_link"><a href="${pdf_url}" target="_blank">
${pdf_title} </a></div></div></div>`;

    setTimeout(() => {
        $(".chats").append(pdf_attachment);
    },
        delay
    );
}
