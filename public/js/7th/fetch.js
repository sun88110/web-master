// fetch.js

fetch('http://localhost:3000/posts') //promise 객체반환. xhtp open,spen, new 스킵
.then(function(response) { //성공할시
    console.log(response);
    return response.json(); // 자바스크립트의 객체변경.
})
.then(function(result){
    console.log(result);
})
.catch(function(err) { //실패할시
    console.log(err);
})