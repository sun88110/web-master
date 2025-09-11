// 자바스크립트 영역.
// 1.값을 저장. => 변수를 활용.
// 2.기능.      => 함수를 활용.
let user_id = "user01"; //문자열.
let user_age = 20; // 숫자.
let is_child = false; // true/false.
function show_info() {
    console.log("회원의 아이디는 " + user_id);
}
show_info(); // 함수실행.

function changeWord() {
    //화면요소를 선택
    document.querySelector('h3#world').innerHTML = "안녕!";
}

//ondition.js에서 활용
function changeValue(){

let score = document.querySelector('#user_value').value;

if(score >= 90){
    console.log("아주 잘했습니다.")
}else if (score >= 80){
    console.log("잘했습니다.")
}else if (score >= 70){
    console.log("보통입니다.")
}else if (score >= 60){
    console.log("노력하세요.")
}else{
    console.log("낙제입니다 .")
}
}