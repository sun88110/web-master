var arr = new Array(); // 배열 생성 

document.querySelector("#item")  // ID 아이템 선택
    .addEventListener("keydown", function (e) { // 키보드 입력시 기능
        if (e.key === "Enter") {                // 누른 키보드가 Enter 라면
            e.preventDefault();                 // 기존 submit 입력값 봉인
            document.querySelector(".addBtn").click();  //만약 enter가 눌린다면 버튼이 클릭됨
        }
    });


document.querySelector(".addBtn")                           // .addBtn을 선택
    .addEventListener("click", function () {                // 버튼을 클릭
        let item = document.querySelector("#item").value;   // item에 id가 item인 값을 넣을 것이다.

        if (item === "") {                                  // item의 값이 없다면
            alert("입력값을 확인해주세요!");                // 경고문을 띄운다
            return;                                         // 반환
        }

        if (arr.includes(item)) {                           // arr안에 있는 값들과 item의 값을 includes로 비교함
            alert("이미 추가된 항목입니다!");               // 있으면 경고문을 띄운다.
            document.querySelector('#item').value = "";     // 그리고 item의 값을 초기화한다.
            return;                                         // 반환
        }

        arr.push(item);                                     // 배열에 item을 추가한다

        console.log(arr);                                   // 콘솔에 배열 상태를 확인함.


        let ul = document.querySelector("#myUL");           // ul을 선택한다.
        if (!ul) {                                          // 만약 ul이 없으면
            ul = document.createElement("ul");              // ul을 생성한다
            ul.id = "myUL";                                 // ul의 id는 myUL로 지정한다
            document.querySelector("#itemList").appendChild(ul);    // 아이디가 itemList의 자식으로 ul을 갔따붙힌다
        }

        let li = document.createElement("li");              // li를 만들어서 li에 넣는다.
        let span = document.createElement("span");          // span을 만들어서 span에 넣는다
        span.innerHTML = "X";                               // span의 내용은 X 이다
        span.setAttribute("class", `close`);                // span의 class는 close로 지정한다
        li.innerHTML = item;                                // li의 내용에 item을 담는다
        li.appendChild(span);                               // li의 자식으로 span을 담는다
        ul.appendChild(li);                                 // ul의 자식으로 li를 담는다

        document.querySelector('#item').value = "";         // id가 item인 요소의 값을 초기화 한다.

        li.addEventListener("click", function () {          // li를 클릭햇을때 기능추가
            if (li.className == "checked") {                // li의 클래스가 checked라면
                li.className = "";                          // 클래스 이름을 초기화
            } else {                                        // 아니라면
                li.setAttribute('class', 'checked');        // 클래스 이름에 checked 추가
            }
        });

        span.addEventListener('click', function (e) {       // span을 클릭햇을때 기능추가
            e.stopPropagation();                            // 기본 제출 동작 방지

            let li = e.target.parentElement;                // li는 해당 타겟은 li의 부모가 li다
            let value = li.firstChild.textContent;          // value는 li의 첫번쨰 자손의 text박스다
            arr = arr.filter(item => item !== value);       // arr는 arr배열의 item과 value를 비교해서 같으면
            li.remove();                                    // li를 지우겟다
        });
    });