/// spread.js
//원시 데이터 타입
let fruit = 'apple';
let newFruit = 'fruit';
newFruit += ", mango";
console.log(fruit, newFruit);

// 배열도 obj
const veggie = ['tomato', 'cucumber', 'beans'];
const newVeggie = veggie;


newVeggie.push("peas");
console.log(veggie, newVeggie); //같은배열을 참조
const anotherVeggie = [...veggie,...['grape']]; //배열안에 배열
veggie.push("peanuts");
console.log(veggie, anotherVeggie);

function sum(a = 0, b = 0, ...num){
    let result = a + b;
    for(let n of num){
        result += n;
    }
    return result;
}
console.log(sum(1, 2, 3, 4, 5, 6));

const myFriend = {
    name: "Hong",
    age: 20,
}

const yourFriend = myFriend; //heap 메모리 주소 참조
myFriend.age = 22;

const anFriend = {...myFriend}; // 새로운 객체 생성
myFriend.name ="Hwang";

console.log(myFriend, anFriend);