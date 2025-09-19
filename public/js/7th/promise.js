// promsie.js
// 콜백함수 -> 순차적으로 구성.

function callFnc(x1 = 0, x2 = 0, anonymousFnc) { //콜백 함수에 3가지를 넣음 x3는 다른게 있어서안됨
    return anonymousFnc(x1, x2); // 0 과 0이 어나니머스에 들어갔어
}

let result = callFnc(10, 20, function (a, b) { // 리저트에 10 + 20 의 기능이 들어갔어
    return a + b;
});

console.log(result);
const promise = new Promise(function (resolve, reject) {  //프로미스에 리졸브랑 리젝트를 호출했어
    resolve("NG"); //리졸브에 NG를 넣엇어
});

promise
.then(function (response){ // 성공적으로 처리한 결과를 받아 넘기는 함수
    console.log(response);
})
.then(function(result){ // 성공하면 그 다음 then이 실행됨
    console.log(result);
})
.catch(function (err){ // 이거는 값 전달이안됐을때 들어가는건가?
    console.log(err);
});