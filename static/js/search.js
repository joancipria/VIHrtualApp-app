let detailBlocks = document.getElementsByTagName("details");

function search(string) {
    // Clean input and create regex
    search_text_value = string.replace(/[.*+?^${}()|[]\]/g, '\$&'); //https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    let regex_object = new RegExp(`${search_text_value}`, "gi");

    // For each <detail> block, count matching strings
    for (let i = 0; i < detailBlocks.length; i++) {

        let paragraph = detailBlocks[i].getElementsByTagName("p")[0];

        let count;
        if (search_text_value == 0) {
            count = 0;
            hideResult(detailBlocks[i]);
        } else {
            count = countString(paragraph.textContent, regex_object)
            showResult(detailBlocks[i], count);
        }

        if (count == 0) {
            hideResult(detailBlocks[i]);
        }

        highlight(regex_object, paragraph);

    }
}

function countString(target, regex) {
    return (target.match(regex) || []).length;
}

function showResult(block, count) {
    let result = block.getElementsByClassName("results")[0];
    result.innerHTML = `${count} resultados`;
    result.hidden = false;
}

function hideResult(block) {
    block.getElementsByClassName("results")[0].hidden = true;
}

function highlight(pattern, paragraph) {
    paragraph.innerHTML = paragraph.textContent.replace(pattern, match => `<mark>${match}</mark>`)
}