// array.js

let fruits = ['사과', '복숭아', '수박', '참외'];
console.log(fruits[0]);
fruits[1] = '멜론';
console.log(fruits[1]);

console.clear();
for(let i = 0; i < 4; i++){
    console.log(fruits[i]);
}

let students = [
    {stdNo: 100, stdName: "김민기", score: 80},
    {stdNo: 200, stdName: "김민준", score: 85},
    {stdNo: 300, stdName: "박충식", score: 88},
];

let str = `<ul>`;
for(let i = 0; i < 3; i++){
    console.log(students[i].stdName);
    str += `<li>학생번호: ${students[i].stdNo}, 이름: ${students[i].stdName}</li>`;
}
str += `</ul>`;
document.writeln(str);
