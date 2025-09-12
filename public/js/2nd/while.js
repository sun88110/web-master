// while.js
// 반복문.
let i = 1;

while(i <= 10){ 
    document.writeln(`현재 값은 ${i} <br>`);
    i++;
}

while (true){
    let rv = parseInt(Math.random()*10);
    console.log(`임의의 값 ${rv}`)
    if (rv == 0){
        break;
    }
}
console.log(';end of prog.');