/*
* operator.js
*/
let num1 = 10;
let num2 = 20;
let result;
result = num1 + num2;
console.log("결과는 " + (num1 / num2));
console.log(num1 + num2 +" 입니다.");

num1 = 425;
result = num1 % num2;
console.log('나머지 ' + result);
num1 = 4;
console.log(num1 % 2); //짝수 홀수 구분.
// 조건문
if (num1 % 2 == 0){
    console.log("even!");
}else if(num1 % 2 == 1){
    console.log("odd!");
}