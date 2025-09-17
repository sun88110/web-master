// scope.js
// 전역 글로벌 vs 지역 로컬

// var & let, const

var myAge = 20;

function showAge(){
    var myAge = 22;
    console.log(myAge + 1);
}
showAge();

{
    var myAge = 10;
    myAge += 1
}


console.log(myAge + 1);

