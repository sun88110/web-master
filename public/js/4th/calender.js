// calendar.js
// 매개값으로 년, 월 활용.
let yyyy = 2025,
    mm = 9;


let holiday = [15, 24];
let today = new Date();
today.setFullYear(yyyy);
today.setMonth(mm - 1); //월 지정 1 ~ 12월
today.setDate(1);
// console.log(new Date(today.getTime() - (1000 * 60 * 60 * 24)));
let spaces = today.getDay(); // 공란의 갯수 몇월의 1일의 위치값을 가져옴 0 ~ 6
// 8월 달의 1일의 위치
// 2025-08-01 => getDay() 요일정보.
// 8월의 마지막날 => 
today.setMonth(mm);
let lastDate =
    new Date(today.getTime() - (1000 * 60 * 60 * 24));
lastDate = lastDate.getDate();
// console.log(today.getDate());
//공란계산
let tr = document.createElement('tr');
for (let s = 0; s < spaces; s++) {
    let td = document.createElement('td');
    tr.appendChild(td);
}
// 날짜계산
for (let d = 1; d <= lastDate; d++) {
    let td = document.createElement('td');
    td.innerHTML = d;
    tr.appendChild(td);
     for (let i = 0; i < holiday.length; i++) {
        if (d == holiday[i]) {
            td.setAttribute('class', 'sunday');
        }
    }
    if ((d + spaces) % 7 == 0) { // 새로운 줄 생성
        td.setAttribute('class', 'saturday');
        document.querySelector('tbody').appendChild(tr);
        tr = document.createElement('tr');
    } else if ((d + spaces) % 7 == 1) {
        td.setAttribute('class', 'sunday');
    }
   
    document.querySelector('tbody').appendChild(tr);
}