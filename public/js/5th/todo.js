// todo.js

let num1 = "";

function star(num) {
    for (let i = 1; i <= num; i++) {
        for (let j = 1; j <= i; j++) {
            num1 += "*";
        }
        num1 += "\n"; // 줄바꿈
    }
}

star(5); // 함수 호출
console.log(num1);

let num2 = "";

function star2(num){
    for (let i = num; i >= 1; i--){
        for(let y = 0; y < num - i; y++){
            num2 += " ";
        }
        for(let j = i; j >= 1 ; j--){
            num2 += "*";
        }
        num2 += "\n"; // 줄바꿈
    }
}

star2(5);
 // 함수 호출
console.log(num2);