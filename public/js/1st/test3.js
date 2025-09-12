/*
 test3.js
*/

// prompt함수를 활용, 2개의 숫자값을 입력.
// 2수의 합이 3의 배수인지 확인

let num1 = prompt("숫자를 입력하세요: ");
let num2 = prompt("숫자를 입력하세요: ");
let result = parseInt(num1) + parseInt(num2); //정수로 바꿔줌

if( (num1 + num2) % 3 == 0){
    console.log("3의 배수이다.")
}else{
    console.log("3의 배수가 아닙니다.")
}