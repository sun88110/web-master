// function.js
// 함수:  코드의 묶음.
let n1 = 0;
let n2 = 0;

{
    let n2 = 2;
    console.log(`${n2}`);
}
//var n3 = 400; 3.14 변경불가
console.log(`${n2}`);


function varFunc(){
    let n1 = 100;
    console.log(`local=> ${n1}`);
}
console.log(`global=> ${n1}`);
varFunc();


function sum(n1, n2){
    let result = n1 + n2;
    console.log(`결과는 ${result}`);
}

sum(10,90);