/*
* test2.js
*/

let friend1 = {
    name: "박규태",
    height: 175,
}

let friend2 = {
    name: "김민식",
    height: 180
}

if(friend1.height > friend2.height){
    console.log(friend1.name + "(이)가 크다");
}

if(friend1.height < friend2.height){
    console.log(friend2.name + "(이)가 크다");
}

if(friend1.height == friend2.height){
    console.log(friend2.name , friend2.name + "두 사람의 키가 동일하다.");
}

let num3 = prompt("숫자를 입력하세요: ");
console.log(num3);

if (num3 % 2 == 0){
    console.log("짝수!");
}else if(num3 % 2 == 1){
    console.log("홀수!");
}