// for.js
let numAry = [10, 20, 30, 40, 50];
let sum = 0;
for (let num of numAry){
    sum += num;
}

// for in 객체
let student ={
    sno : 100,
    sname : "김민수",
    score : 80,
}

for(let prop in student){
    console.log(prop, student[prop]);
}