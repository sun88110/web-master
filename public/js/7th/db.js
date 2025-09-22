// db.js
// console.log(document.forms);
// console.log(document.forms.postForm);
// console.log(document.forms['postForm']);
// console.log(document.forms[0]);

// 추가버튼.
console.log(document.forms['postForm']); //forms 는 모든 form을 가져옴 document.forms.postForm <- 이름가져오기
document.forms["postForm"].addEventListener("submit", function (e) {
    e.preventDefault(); //원기능삭제
    let title = document.querySelector('[name="title"]').value;
    let author = document.querySelector('[name="author"]').value;
    if (!title || !author) { //둘중 하나라도 없으면
        alert('내용, 작성자 입력해주세요.');
        return;
    }
    // ajax.요청방식 :post
    fetch("http://localhost:3000/posts", {
            method: 'post',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body:JSON.stringify({title, author}), //josn posts를 문자열로 변경
        })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            let div = addpost(result);
            document.querySelector('#data-container').appendChild(div)
        })
        .catch((err) => console.log(err));
});


// 게시글목록.
fetch('http://localhost:3000/posts') // json문자열 데이터.
    .then(Response => Response.json()) //리턴생략가능 리스폰스 json() 으로 감 문자열로 바꿔줌
    .then(result => {
        console.log(result);
        let list = ["id", "title", "author"];
        result.forEach(item => {
            console.log(item);
            let div = addpost(item);
            document.querySelector('#data-container').appendChild(div)
        });
    })
    .catch((err) => console.log(err)); // 오류시 오류출력

    function addpost(post){ 
        let fields = ['id', 'title', 'author'];
        let div = document.createElement('div')
            for(let i = 0; i < fields.length; i++){
                let span = document.createElement('span');
                span.innerHTML = post[fields[i]];
                span.setAttribute('class', `data-${fields[i]}`);
                div.appendChild(span); 
            }
            let span = document.createElement("span");
            let btn = document.createElement("button")
            btn.innerHTML= '배진욱꺼';
            btn.addEventListener('click', function(e){
                // console.log(e.target.parentElement.parentElement);
                // console.log(e.target.parentElement.parentElement.children[0].innerHTML);
                // fetch(`http://localhost:3000/posts/${e.target.parentElement.parentElement.children[0].innerHTML}`, {
                //     method:'Delete',
                // })

                // e.target.parentElement.parentElement.remove();
                del(e);
                })
            span.appendChild(btn);
            div.appendChild(span);
            return div;
    }

    function del(e){
        fetch(`http://localhost:3000/posts/${e.target.parentElement.parentElement.children[0].innerHTML}`,{
            method: 'Delete',
        })
        e.target.parentElement.parentElement.remove()
    }