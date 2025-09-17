// array3.js
// 객체
const friends =[{
    name: '김우진',
    phone: '010-1111-2222'
}]

friends.push({
    name: '박은식',
    phone: '010-2222-3333'
});

friends.push({
    name: '김우식',
    phone: '010-3333-4444'
});

let search;
//forEach
console.log(friends);
friends.forEach(function (item, idx, ary){
    if(item.name == search)
    console.log(`${search}의 연락처는 ${item.phone}`);
});

// data 사원정보
// 1. 급여가 5000 이상의 사원출력 "이름, 급여"
// 2. 남자사원들만 maleAry에 추가
const maleAry = new Array();
// data.forEach(function(item, idx, ary){
//     // if(item.id > 5){
//     //     console.log(item);
//     // }
//     if(item.gender == "Male"){
//         maleAry.unshift(item); //역순 출력
//     }
// });
// sort 정렬
maleAry.sort(function (a,b){
    if(a.id < b.id){
        return -1;
    }else {
        return 1;
    }
})

//maleAry.sort() //정렬 함수 뒤에 .reverse() 붙히면 리버스
console.log(maleAry);

console.log(['사과', '복숭아', '수박', '오렌지'].sort().reverse());
console.log([10, 34, 33, 1, 100].sort(function(a,b){
    if(a - b < 0){
        return -1;
    }else{
        return 0;
    }
}));


const json = `[{"id":1,"first_name":"Cherry","last_name":"Grandison","email":"cgrandison0@dell.com","gender":"Female","ip_address":3654},
{"id":2,"first_name":"Malchy","last_name":"Hellier","email":"mhellier1@mapy.cz","gender":"Male","ip_address":8437},
{"id":3,"first_name":"Winnie","last_name":"De Beneditti","email":"wdebeneditti2@mapquest.com","gender":"Male","ip_address":6632},
{"id":4,"first_name":"Bear","last_name":"Weighell","email":"bweighell3@cdbaby.com","gender":"Male","ip_address":3882},
{"id":5,"first_name":"Delmore","last_name":"Tompion","email":"dtompion4@washington.edu","gender":"Male","ip_address":7049},
{"id":6,"first_name":"Lezlie","last_name":"Jenson","email":"ljenson5@eepurl.com","gender":"Female","ip_address":9516},
{"id":7,"first_name":"Orly","last_name":"Aubri","email":"oaubri6@bbc.co.uk","gender":"Female","ip_address":6371},
{"id":8,"first_name":"Schuyler","last_name":"Maiden","email":"smaiden7@studiopress.com","gender":"Male","ip_address":7659},
{"id":9,"first_name":"Bethanne","last_name":"Bollini","email":"bbollini8@t-online.de","gender":"Female","ip_address":4932},
{"id":10,"first_name":"Freeman","last_name":"Aronov","email":"faronov9@usda.gov","gender":"Male","ip_address":9458},
{"id":11,"first_name":"Westbrooke","last_name":"Tarbett","email":"wtarbetta@parallels.com","gender":"Male","ip_address":9752},
{"id":12,"first_name":"Rhoda","last_name":"Ewols","email":"rewolsb@themeforest.net","gender":"Female","ip_address":5679},
{"id":13,"first_name":"Ethelda","last_name":"Stanner","email":"estannerc@mashable.com","gender":"Female","ip_address":5294},
{"id":14,"first_name":"Yul","last_name":"Enston","email":"yenstond@reddit.com","gender":"Male","ip_address":7841},
{"id":15,"first_name":"Rayna","last_name":"Pagan","email":"rpagane@bbc.co.uk","gender":"Female","ip_address":6020}]`
//json 문자열.
const data = JSON.parse(json); // 파싱타입으로 변경
console.log(data);
const jsonObj = JSON.stringify(data); //문자열로 변경
console.log(jsonObj);