// todo.js
document.querySelectorAll("span.close")
    .forEach(item => {
        item.addEventListener('click', function (e) {
                e.stopPropagation(); //이벤트 전파 차단 겹친거 안눌리게 e.preventDefault는 기본기능차단
                e.target.parentElement.remove()
            },
           true // bubbling 방식은 (하위요소에서 상위로), capturing(상위요소에서 하위로)
        )
    })

document.querySelectorAll("ul>li")
    .forEach((item) => {
        item.addEventListener("click", function () {
            if (item.className == "checked") {
                item.className = "";
            } else {
                item.setAttribute('class', `checked`);
            }
        }, )
    })


document.querySelector(".addBtn")
    .addEventListener("click", function () {
        let inpVal = document.querySelector("#myInput").value;
        if (inpVal === "") return; // 빈 값 입력 방지
        let li = document.createElement("li");
        let ul = document.querySelector("#myUL");
        let span = document.createElement("span");
        span.innerHTML = "X";
        span.setAttribute("class", `close`);
        li.innerHTML = inpVal;
        ul.appendChild(li);
        li.appendChild(span);
        li.addEventListener("click", function () {
            if (li.className == "checked") {
                li.className = "";
            } else {
                li.setAttribute('class', 'checked');
            }
        }, true);
        span.addEventListener('click', function (e) {
            e.stopPropagation();
            e.target.parentElement.remove();
        }, true);
    })

function newElement() {
    let txt = document.getElementById("myInput").value;
    //생성할 html
    let cloned = document.querySelector("#myUL>li").cloneNode(true);
    let spand = cloned.querySelector("span");
    //cloned.classname = "btn btn-primay checked"; //클래스가 만약3개면
    cloned.classlist.remove('checked'); //체크드만 지우겟다  cloned.classlist.add('checked'); 
    cloned.innerHTML = txt;
    cloned.appendChild(spand);
    console.log(cloned);
    document.querySelector('#myUL').appendChild(cloned);
}