// dom.js
// createElement()
// appendChild()
// innerText, interHtml, textContent

let students = [{stdNo: 100, stdName: '홍길동', score:80}, {stdNo: 200, stdName: '김길동', score:80}];

//등록이벤트
document.querySelector('button#addBtn')
.addEventListener('click', function() {
    //등록 정보
    const newElement = {
        stdNo: document.querySelector('#student_no').value,
        stdName: document.querySelector('#student_name').value,
        score: document.querySelector('#score').value,
    }
    let tr = makeTr(newElement);
    // tbody에 등록
    document.querySelector('#list tbody').appendChild(tr);
});

for (let prop in students[0]){
    console.log(prop, students[0][prop]);
}

function createStdList() {
    //데이터 건수만큼 반복.`
    for (let i = 0; i < students.length; i++){
        let tr = makeTr(students[i]);
        document.querySelector('#list tbody').appendChild(tr);
    }
}

function makeTr(newElement){
    console.log(newElement);
        let tr = document.createElement('tr');// <tr></tr>
        for (let prop in newElement){
            let td = document.createElement('td'); //<td></td>
            td.innerHTML = newElement[prop];
            tr.appendChild(td); //<tr><td>100</td><td>홍길동</td></tr>
        }
        //삭제버튼.
        let td = document.createElement('td');
        let btn = document.createElement('button');
        btn.addEventListener('click', function (e) {
            console.log(e);
            e.target.parentElement.parentElement.remove();
        });
        btn.setAttribute('class', 'btn btn-danger');
        btn.innerHTML = '삭제';
        td.appendChild(btn);
        tr.appendChild(td);
        //생성한 tr 반환
        return tr;
    }

createStdList();


            // td = document.createElement('td'); //<td></td>
            // td.innerHTML = students[i].stdName;
            // tr.appendChild(td); //<tr><td>100</td><td>홍길동</td></tr>