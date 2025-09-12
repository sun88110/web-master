//매개값 2개 => 1, 10 : 1부터 10 사이 값을 모두 더하는것

function sum(n1, n2){


    return n1 + n2
}

let result = sum(sum(10, 20), sum(12, 24));
console.log(`결과는 ${result}`);