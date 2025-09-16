// array2.js

const numAry = new Array(); //[]; 배열 선언
numAry.push(10); //[10]
// numAry = []; //상수는 재할당이 불가
numAry.push(25); //[10,25]
numAry.push(34); 
numAry.unshift(47);
numAry.splice(2, 0, 33); 
numAry.splice(2, 0, 22, 19); 

let sum = 0;
numAry.forEach(function (item, idx, ary) {
    console.log(item);
    if(idx == 0 || idx == ary.length - 1){
    sum += item; // sum = sum + item;
    }
});

console.log(`sum의 값은 ${sum}`);

let tmi = [{
    num : 1,
    name : "김동우",
    scroe : 100,
},  {
    num : 2,
    name : "김현태",
    scroe : 90,
    }
]

for(let i = 0; i < tmi.length; i++){
    let tr = document.createElement('tr');
    for(let prop in tmi){
        let td = document.createElement('td');
        td.innerHTML = tmi[i][prop]
        tr.appendChild(td);
    }
} 
