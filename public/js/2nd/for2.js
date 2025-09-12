// for2.js
// 조건문 추가.
let sum  = 0;
let even = 0;
let odd  = 0;


console.log(parseInt(Math.random() * 10)); // 0 <= x < 10 값의 범위
let ran

//1~100 까지의 숫자 중에서 2의 배수, 3의 배수를 저장하는데 따로 저장
for (let i = 1; i <= 100; i++){
    ran = parseInt(Math.random() * 10) + 1;

    if ( ran % 2 == 0){
        even += ran;
    }
    if (ran % 3 == 0){
        odd += ran;
    }
}
console.log(`2의 배수의 합은 ${even}, 3의 배수의 합은 ${odd}`);


//1~100 까지의 숫자 중에서 2의 배수, 3의 배수를 저장하는데 따로 저장
for (let i = 1; i <= 100; i++){
    if ( i % 2 == 0){
        even += i;
    }
    if (i % 3 == 0){
        odd += i;
    }
}
console.log(`2의 배수의 합은 ${even}, 3의 배수의 합은 ${odd}`);

//1~100값 중에서 3의 배수의 합을 구하도록.
for (let i = 1; i <= 100; i++){
    if ( i % 3 == 0){
        sum += i;
    }
}
console.log(`3의 배수의 합은 => ${sum}`);

for (let i = 1; i <= 10; i++){
    sum += i;
    if (sum >= 30){
    console.log(`현재 i의 값은 => ${i}; sum은 ${sum}`);
    }
}

for(let i = 1; i <= 10; i++){
    if(i % 2 == 0){
    console.log(`현재 i의 값은 => ${i}`);
    }
}