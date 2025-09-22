// covid.js
const url = `https://api.odcloud.kr/api/15077586/v1/centers?page=1&perPage=284&serviceKey=1cca3ad9f4857630c0d93d25a725ebfb1cee018ca68294802960c95453808610`;

let total = [] // 센터목록
// 목록.
fetch(url)
    .then(resp => resp.json()) // json포맷 => 자스객체
    .then((result) => {
        total = result.data;
        showPageList(1);
    })
    .catch((err) => console.log(err));

// 건수에 따라 페이징목록 =>1,         11,12,13,14,15,16,17,18,19,20,           29
function makePagingList() {
    const paging = {
        currPage: 1,
        startPage: 1,
        endPage: 10,
        prev: false,
        next: false,
        initPage(page = 1, totalCnt = 284) {
            let realEnd = Math.ceil(totalCnt / 10);
            this.currPage = page;
            this.endPage = Math.ceil(page / 10) * 10; // 반올림
            this.startPage = this.endPage - 9;
            this.prev = this.startPage == 1 ? false : true; // 이전 10개의 페이징 존재여부
            // this.next = this.end > realEnd ? realEnd : this.end; // 이후 10개의 페이징 존재여부
            this.next = this.endPage < realEnd ? true : false;
        },
    };

    paging.initPage(10);
    console.log(paging);
    //ul tag
    let target = document.querySelector('ul.pagination');
    target.innerHTML = '';
    //이전페이징생성.
    if (paging.prev) {
        let li = document.createElement('li');
        li.className = 'page-item';
        let a = document.createElement('a');
        a.innerText = "Previous";
        a.className = "page-link";
        a.setAttribute('herf', "#");
        li.appendChild(a);
        target.appendChild(li);
    } else {
        let li = document.createElement("li");
        li.className = 'page-item disabled'
        let a = document.createElement("a");
        a.innerText = "Previous";
        a.className = "page-link";
        li.appendChild(a);
        target.appendChild(li);
    }

//페이징생성
for (let s = paging.startPage; s <= paging.endPage; s++) {
    let li = document.createElement('li');
    li.className = 'page-item';
    let a = document.createElement("a");
    a.innerText = s;
    a.className = 'page-link';
    a.setAttribute('href', "#");
    li.appendChild(a);
    target.appendChild(li);
}
//이후페이징생성
if (paging.next) {
    let li = document.createElement('li');
    li.className = 'page-item';
    let a = document.createElement('a');
    a.innerText = "Next";
    a.className = "page-link";
    a.setAttribute('herf', "#");
    li.appendChild(a);
    target.appendChild(li);
} else {
    let li = document.createElement("li");
    li.className = 'page-item disabled'
    let a = document.createElement("a");
    a.innerText = "Next";
    a.className = "page-link";
    li.appendChild(a);
    target.appendChild(li);
}
pageLinkEvent();
}
makePagingList();

// 화면의 a 링크생성.
function pageLinkEvent() {
    document.querySelectorAll('a.page-link').forEach(item => {
        // 이벤트등록.
        item.addEventListener('click', function (e) {
            e.preventDefault();
            let page = item.innerHTML;
            showPageList(page);
        })
    })
}
pageLinkEvent();

// 페이지 목록 출력.
function showPageList(page = 1) {
    //초기화
    document.querySelector('#centerList').innerHTML = "";
    let start = (page - 1) * 10;
    let end = page * 10;
    total.filter(item => item.id > start && item.id <= end)
        .forEach((center) => {
            let tr = makeRow(center);
            document.querySelector("#centerList").appendChild(tr);
        })
}
makePagingList();

// 센터 -> 한건 출력.
function makeRow(center) {
    const fields = ['id', 'centerName', 'address', 'sido'];
    let tr = document.createElement('tr');
    for (let field of fields) {
        let td = document.createElement('td')
        td.innerHTML = center[field];
        tr.appendChild(td);
    }
    return tr;
}