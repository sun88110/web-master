// storage.js
console.log(window)
// JSON.stringify() <- 이게 가장 좋음
// localStorage.setItem('myName', "배진욱"); //localstorage는 정보를 저장함 캐시 삭제하면 사라짐
// localStorage.setItem("myInfo", '{"name": "Hong", "age": 20}');
// let info = JSON.parse(localStorage.getItem("myInfo"));
// console.log(info);

// 1. 데이터 생성 + JSON 형태로 localStorage에 저장
// localStorage.+("gel", JSON.stringify([
//   {
//     bno: 1,
//     title: "연습글입니다.",
//     content: "연습하고 있습니다.",
//     writer: "김현태"
//   },
//   {
//     bno: 2,
//     title: "생일입니다.",
//     content: "선물을 강탈하고 있습니다.",
//     writer: "도우서"
//   }
// ]));

// 2. 저장된 데이터 꺼내서 파싱

// 3. DOM에 출력
function loadData() {
    let data = JSON.parse(localStorage.getItem("students"));
    document.querySelector(".data-container").innerHTML = "";
    data.forEach((item) => {
        let div = document.createElement('div');
        for (let prop in item) {
            let span = document.createElement('span');
            span.innerHTML = item[prop];
            span.setAttribute('class', `data-${prop}`);
            div.appendChild(span);
        }
        //수정화면으로 이동하는 버튼.
        let btn = document.createElement("button");
        btn.innerHTML = '수정';
        btn.addEventListener('click', function (e) {
            // search
            localStorage.setItem('search', item.sno);
            location.href = "update.html";
        });
        div.appendChild(btn);
        document.querySelector('.data-container').appendChild(div); // or document.querySelector('body')
    });
}
loadData();

//현재값을 불러오기.
document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    let sno = document.getElementById("sno").value;
    let sname = document.getElementById("sname").value;
    let score = document.getElementById("score").value;
    console.log();
    // 입력값 확인
    let data = JSON.parse(localStorage.getItem("students"));
    if (!sno || !sname || !score) {
        alert("값을 입력해주세요!");
        return;
    }
    // 중복 확인
    if(data.filter(item => item.sno==sno).length){
        alert('중복');
        return;
    }
    
    if (!confirm("저장하시겠습니까?")) {
        alert("취-소");
        return;
    }
    data.push({
        sno,
        sname,
        score
    });
    localStorage.setItem('students', JSON.stringify(data));
    loadData();
})