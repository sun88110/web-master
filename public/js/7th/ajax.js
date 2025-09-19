// ajax.js
// 비동기방식 vs 동기방식
// Astnhronous Javascript And XML
function backup() {
    let members = [];

    const xhtp = new XMLHttpRequest();
    xhtp.open('get', '../5th/data.json');
    xhtp.send();
    xhtp.onload = function () {
        members = JSON.parse(xhtp.responseText);
        console.log(members);
    };
}

setTimeout(function () {
    console.log("첫번째 함수");

    setTimeout(function () {
        console.log("두번째 함수");

        setTimeout(function () {
            console.log("세번째 함수");

            
        }, 500);
    }, 2000);
}, 1000);

