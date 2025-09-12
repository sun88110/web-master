// function2.js
// 매개변수(2개)
//구구단 3단을 콘솔에 출력하는 함수 => multiplication
//매개값 2개 => 1, 10 : 1부터 10 사이 값을 모두 더하는것
function sumBy2Number(n1, n2){
    let sum = 0;
    if (n2 < n1){
        let n3 = 0; n3 = n1; n1 = n2; n2 = n3;
    }
    for(let i = n1; i <= n2; i++){
        sum += i;
    }

}

sumBy2Number(10, 1);

// function multiplication(num){
//     for(let i = 1; i < 10 ; i++){
//             console.log(`${num} * ${i} = ${num*i}`);
//     }
// }

// multiplication(99);

// function showMax(num1, num2){
//     if(num1 > num2){
//         console.log(`${num1}이(가) ${num2} 보다 더 큽니다.`)
//     }
//     else if(num1 < num2){
//         console.log(`${num2}이(가) ${num1} 보다 더 큽니다.`)
//     }
//     else{
//         console.log(`두 수가 같습니다.`)
//     }
// }

// showMax(4,9);