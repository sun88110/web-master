// json.js
//DB 저장.
//자바,제이슨 자바스크립트.
//서버프로그램 아파치, 익스프레스.
//텍스트(XML,JSON) 데이터 송신.
//클라이언트 프로그램.(HTML,CSS,JS)
//http://127.0.0.1:5500/public/js/5th/index.html
//http://127.0.0.1:5500/public/js/5th/data.json

const xhtp = new XMLHttpRequest();
xhtp.open('get', 'data.json'); // 서버의 요청할 페이지 지정,
xhtp.send(); // 실제 요청
xhtp.onload = function(){ // 이벤트 관련속성
    let data = JSON.parse(xhtp.responseText);
    console.log(data);
    let fields = ['id', 'first_name', 'last_name', 'gender', 'ip_address']
    data.forEach(function (item, idx, ary){ //item은 배열에 들어있는 요소 하나하나 전부 아이디,젠더,이름 등등
        let tr = document.createElement('tr');
        for(let i = 0; i < fields.length; i++){
            let td = document.createElement('td');
            td.innerHTML = item[fields[i]];
            tr.appendChild(td);
        }
        document.querySelector('#list').appendChild(tr);
    });
};