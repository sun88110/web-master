let students = [{
        stdNo: 1,
        stdName: "킴",
        score: 80,
    },
    {
        stdNo: 2,
        stdName: "박",
        score: 70,
    }
]

function start() {
    for (let i = 0; i < students.length; i++) {
       let tr = maketable(students[i]);
        document.querySelector('#list tbody').appendChild(tr);
    }
}

start();


function maketable(newElement) {
    let tr = document.createElement('tr');
    for (let prop in newElement) {
        let td = document.createElement('td');
        td.innerHTML = newElement[prop];
        tr.appendChild(td);
    }
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
        
    return tr;
}

let arr = [{
        stdNo: 1,
        stdName: "킴",
        score: 80,
    },
    {
        stdNo: 2,
        stdName: "박",
        score: 70,
    }
]


function start(){
    for(let i = 0; i < arr.length; i++){
        let tr = document.createElement('tr');
        for(let prop in arr){
            let td = document.createElement('td');
            td.innerHTML = arr[i][prop];
            tr.appendChild(td);
        }
        let td = document.createElement('td');
        let btn = document.createElement('button');
        btn.addEventListener("click", function(e){
            e.target.parentElement.parentElement.remove();
        })
        btn.setAttribute('class', 'btn btn-danger');
        btn.innerHTML = '삭제';
        td.appendChild(btn);
        tr.appendChild(td);
        document.querySelectct("#list tbody").appendChild(tr);
    }
}