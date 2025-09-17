// object.js
let obj = {}
let obj2 = obj;
console.log(obj == obj2);

let obj3 = {}

obj.name = 'Hong';
obj.age = 20;

obj3.name = 'Hong';
obj3.age = 20;

console.log(obj.name == obj3.name);

let str1 = 'Hong'
let str2 = 'Hong';

let ary = [];
console.log(typeof ary);

str1 = 10;
str2 = '10';

console.log(str1 === str2);

// 함수 정의식 vs 함수 표현식           함수 표현식이 기초적
// function sum(num1, num2){
//     return num1 + num2;
// }

// 줄인 표현식 => 화살표 함수,
const sum = (num1=0, num2=0) => num1 + num2;

console.log(sum(sum(1, 2), sum(2)));

[23, 10, 17, 45].forEach((item) =>  console.log(item));