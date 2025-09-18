// db.js

// 이벤트.
document.querySelector('div.container>form') //div.container의 바로 아래있는 form > 없으면 컨테이너 아래의 모든 form
    .addEventListener('submit', function (e) { //e벤트로 받아오겟다는 명령어
        e.preventDefault(); //기본 기능 차단
        addPost();
    });

function addPost() {
    const xhtp = new XMLHttpRequest();
    xhtp.open('post', 'http://localhost:3000/posts');
    // 요청 헤더: 컨텐트 형식 작성
    xhtp.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
    xhtp.send(JSON.stringify({
        title: document.querySelector('input[name="title"]').value,
        author: document.querySelector('input[name="author"]').value
    }));
    xhtp.onload = function () {
        let result = JSON.parse(xhtp.responseText);
        let div = makeRow(result);
        document.querySelector('#data-container').appendChild(div);
        //초기화
        document.querySelector('input[name="title"]').value
        document.querySelector('input[name="author"]').value
        //location.reload(); [새로고침]
    }
}
//addPost();

const xhtp = new XMLHttpRequest();
xhtp.open('get', 'http://localhost:3000/posts');
xhtp.send();
xhtp.onload = function () {
    let data = JSON.parse(xhtp.responseText);
    //console.log(data);
    let fields = ['id', 'title', 'author'];
    data.forEach(function (item, idx, ary) {
        let div = document.createElement('div');
        div = makeRow(item);
        document.querySelector('#data-container').appendChild(div);
    })
}

// 데이터 게시글 한건에 대한 row \
function makeRow(post) {
    let fields = ['id', 'title', 'author'];
    let div = document.createElement('div');
    // div에 클릭이벤트.
    div.addEventListener('click', function () {
        // 댓글목록을 가져와서 보여주기.
        let id = post[fields[0]];
        let ps = this;
        showComments(id, ps);
    })
    for (let i = 0; i < fields.length; i++) {
        let span = document.createElement('span');
        span.classList.add(`data-${fields[i]}`);
        span.innerHTML = post[fields[i]];
        div.appendChild(span);
    }
    return div;
}


function showComments(id, ps) {
    const xhtp = new XMLHttpRequest();
    xhtp.open('get', 'http://localhost:3000/comments');
    xhtp.send();
    xhtp.onload = function () {
        let data = JSON.parse(xhtp.responseText)
        .filter(item => {
            return item.postsId == id;
        });
        data.forEach(function (item, idx, ary) {
            let div = document.createElement('div');
            div = makeRow2(item);
            ps.appendChild(div);
        })
    }
}

function makeRow2(post) {
    let fields = ['id', 'content', 'postsId'];
    let div = document.createElement('div');
    // div에 클릭이벤트.
    div.addEventListener('click', function () {
        let id = post[fields[0]];
        let ps = this;
        showComments(id, ps);
    })
    for (let i = 0; i < fields.length; i++) {
        let span = document.createElement('span');
        span.classList.add(`data-${fields[i]}`);
        span.innerHTML = post[fields[i]];
        div.appendChild(span);
    }
    return div;
}