// document.querySelector('table').remove();


let str = 'Lorem ipsum dolor';
// sit amet consectetur adipisicing elit. Unde adipisci ullam itaque libero obcaecati illo nesciunt corrupti, veniam commodi distinctio. Labore incidunt magni reprehenderit quidem veniam aspernatur fugit, tempora pariatur.';
let strAry = str.split(' '); // 구분자(' ')를 기준으로 문자열 배열로 생성
const outer = document.querySelector('div.outer');

strAry.forEach(function(item, idx, ary){
    let div = document.createElement("div");
    div.innerHTML = item;
    div.setAttribute("class", "inner");
    outer.appendChild(div);
});

let timing = 60;

//이벤트 (찾기 버튼 클릭하면 alert('클릭))
document.querySelector('#search_word')
    .addEventListener('click', function () {
        let search = document.querySelector('#user_value').value;
        let is_exist = false;

        document.querySelectorAll('div.inner').forEach(function (item) {
            if (item.innerHTML === search) {
                item.remove();
                is_exist = true;
            }
        });

        if (is_exist) {
            alert('같은 값이 있습니다!');
        } else {
            alert('같은 값이 없습니다!');
        }

        document.querySelector('#user_value').value = '';
        console.log(document.querySelectorAll('div.inner').length);
    });

setInterval(function() {
    console.log(timing--);
    let esc = false;
    if(timing <= 0 && document.querySelectorAll('div.inner').length > 0){
        alert('실패!');
    }
    if(timing > 0 && document.querySelectorAll('div.inner').length == 0){
        esc = true;
    }

    if(esc){
        alert('성공!');
        timing = 0;
    }
}, 1000);
