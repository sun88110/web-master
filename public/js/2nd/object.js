// object.js

let obj = {
    name: "홍길동",
    age: 20,
    showInfo: function() {
        return  `이름은 ${obj.name}, 나이는 ${obj.age}`;
    }
}

console.log(obj.showInfo());