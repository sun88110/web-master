// string.js
let name = "Hong";
let age = 20;
let result ='';
let obj ={
    name : "홍길동",
    bt: "o",
    show() {
        return this.name + ths.bt;
    }
}


if(age >= 20){
    result = "성인";
}else{
    result = "미성년";
}

result = age >= 20 ? '성인' : '미성년'; //3항 연산식

console.log(`내 이름은 ${name == "Hong"}, ${age >= 20 ? "성인" : "미성년"}`);

// indexOf('매개값')
let idx = "Hello, World".indexOf("W"); // 7
console.log(idx)

idx = "김성태, 박명식, 홍길동".indexOf("박명석"); // -1 반환

let myFriends = ["김성태", "박명식", "홍길동"];

myFriends.forEach((item, idx, gry) => {
    if(item == "박명식"){
        console.log(item);
    }
    if (item.indexOf("박명식") != -1){
        console.log(item)
    }
    if (item.indexOf("박") == 0) { //성이 박씨인 사람을 출력하겟다
        console.log(item)
    }
});
//원시데이터. string, number, boolean, 
// slice
console.log('pizza, orange, cereals'.slice(-7).toUpperCase());
console.log('pizza, orange, cereals'.substring(0, 5).toLowerCase());

// charAt()
console.log("Hello, World".charAt(7)); // W

// replace()
console.log("Hello, World".replace("W", "w"));

// trim()
console.log("     Hellow    ".trim()); //공백제거

let str = "Na";
let Bat = "BatMan";

let batman = str.repeat(8) + " " +  Bat;

console.log(batman);

const code = "ABCDEF";
console.log(code.startsWith("DEF", 3));

console.log(code.endsWith("def"));

//1번
function getGender(no){
    //주민번호 성별 뒷자리 7중에 1번째 값이 1,3 남 / 2,4 여
    if(no.length == 13){
        var un = no.charAt(6);
    }else if(no.length == 14){
        var un = no.charAt(7);
    }
    if(un === "1" || un === "3"){
        console.log(`${no}의 성별은 남자 입니다.`)
    }else if(un === "2" || un === "4"){  
        console.log(`${no}의 성별은 여자 입니다.`)
    }else {
        console.log(`입력하신 번호를 확인해주세요`);
    }

    // let pos = -1;
    // pos = no.length == 14 ? 7 : 6;
    // if(no.charAt(pos) == 1 || no.charAt(pos) == 3){
    //     //
    // }
}
const numAry = ["990101-1234567", "030303-3234545", "980304 2324567", "1234567891234", "0303033234545", "9803042324567"];
numAry.forEach((item) => {
    getGender(item);
})

//2번. 사용자 아이디 확인
function getId(mail){
//메일 주소에서 아이디부분 반환.
    let pos = mail.indexOf("@");
    console.log(mail.substring(0, pos));
}
const emails = [
    "Idubarrye@oracle.com",
    "aschlag@smugumg.com",
    "hiffe2@wiley.com",
    "usteptoe0@marketwarch.com",
]
emails.forEach((item) => {
    getId(item);
})