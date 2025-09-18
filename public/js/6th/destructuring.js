// destructuring.js
const person = {
    name: "홍길동",
    age: 20,
};

let {
    name,
    age
} = person;

const numAry = [10, 20, 30];
let [n1, n2, n3] = numAry;
console.log(n1, n2, n3);

// 배열메소드 : forEach(), map(), filter(), reduce()
const stdAry = [
    { sno: 100, name: "홍길동", score: 80 },
    { sno: 200, name: "김민수", score: 60 },
    { sno: 300, name: "박민규", score: 70 },
];

const newAry = stdAry.map(item => {
    const {sno: sn, name: nm} = item; // 객체 디스트쳐링
    return {sn,nm};
})

console.log(newAry)