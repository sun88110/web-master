//array.js
//배열메소드
const obj ={
    name : '홍길동',
    age : 20,
    showInfo : function(){
        return `이름은 ${obj.name}, 나이는 $[obj,age]`
    }
}

const fruits = ['사과', '복숭아'];
fruits[fruits.length] = '배';
fruits[fruits.length] = '참외';
fruits[0] = '포도'; //사과 -> 포도
delete fruits[0]; //포도 -> undefined.

// 메소드. 추가, 삭제(push, pop <- 가장 뒤에서 하나씩 추가, 제거)
fruits.push('메론');
fruits.pop();
// unshift, shift <- 앞에서부터 하나씩 추가, 제거
fruits.unshift('메론'); // <-이거 쓰면 역순으로 출력가능 예시는 array3.js에 있음
fruits.shift();

// string, number, boolean, {}, [], undefined
// splice <- 배열 중간에 짤라내기
fruits.splice(1, 1); // 인덱스 위치 ~ 삭제할 갯수
fruits.splice(0, 1, '사과'); // 0번째 인덱스에 있는 1개를 가져와서 사과를 추가
fruits.splice(1, 0, '수박'); // 2번째 인덱스에 수박 추가
fruits.splice(1, 3, '수박'); // ['사과', '수박'] 1~3사이에 수박 

for (let i = 0 ; i < fruits.length; i++){
    console.log(fruits[i]);
}