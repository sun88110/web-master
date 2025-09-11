/*
 * variable.js
 */
let myName = "배진욱"; // 문자열.
let myAge = 20; // 숫자형.
let pets = [{
    name: "야옹이",
    age: 3
}, {
    name: "멍멍이",
    age: 4
}]; // 배열. {name, age}

let myFriend = {
    name: "배진욱",
    age: 20,
    phone: "010-1234-5678",
    addr: "아틀란티스"
} // 객체.

pets[0].age = 2;
console.log(pets[0].age)

// console.log(myFriend.name); // 변수 (객체).속성
// console.log(myFriend.age);
// 야옹이의 이름,나이