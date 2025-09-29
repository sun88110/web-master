        // http://localhost:3000/emp => json데이터
        fetch('http://localhost:3000/emp/ALL/ALL/-1') //전체목록 가져오기
        .then(Response => Response.json())
        .then((result) => {
            console.log(result);
            result.forEach(item => {
            let tr = makeRow(item);
            document.querySelector('#list').appendChild(tr);
        });
        })
        .catch((err) => console.log(err));

        //이벤트.
        console.log(document.forms);
        document.forms[0].addEventListener('submit', function(e){
            e.preventDefault();
            let eno = document.querySelector("#employeeId").value;
            let ename = document.querySelector("#employeeName").value;
            let job = document.querySelector("#job").value;
            let hd = document.querySelector("#hireDate").value;
            let deptno = document.querySelector("#deptNo").value;

            // json 포맷으로 서버 전달.
            fetch('http://localhost:3000/emp', {
                method:'post',
                headers:{ 'Content-Type':'application/json;charset=utf-8' },
                body: JSON.stringify({eno, ename, job, hd, deptno }),
            })
            .then(response => response.json()) //응답결과를 넘기기
            .then(result => { //콘솔에 결과 찍어보기
                console.log(result);
            })
            .catch((err) => console.log(err)); //중간에 에러뜨면 에러띄우기
        });


        //조건 검색.
        document.querySelector('#searchForm button[type="button"]') //버튼타입이 버튼인녀석
        .addEventListener('click', function(e){
            const ename = document.querySelector('#search-name').value || "ALL";
            const job = document.querySelector('#search-job').value || "ALL";
            const deptno = document.querySelector('#search-dept').value || "-1";
            let url = `http://localhost:3000/emp/${ename}/${job}/${deptno}`;
            fetch(url)
            .then(response => response.json())
            .then(result => {
                console.log(result);
                document.querySelector("#list").innerHTML = ""; //기존목록비우기
                result.forEach((item) => {
                    let tr = makeRow(item);
                    document.querySelector("#list").appendChild(tr);
                })
            })
            .catch((err) => console.log(err));
        })


        // 사원정보 1건을 가지고 row를 생성함
        function makeRow(employee){
            let fields = ['EMPNO', 'ENAME', 'JOB', 'DNAME','SAL'];
            let tr = document.createElement("tr");
            tr.setAttribute("data-eno", employee.EMPNO);
            fields.forEach(field =>{
                let td = document.createElement("td");
                td.innerHTML = employee[field];
                tr.appendChild(td);
            });
            //삭제버튼.
            let btn = document.createElement("button");
            btn.innerHTML = "삭제";
            btn.addEventListener('click', deleteFunc);
            let td = document.createElement("td");
            td.appendChild(btn);
            tr.appendChild(td);
            return tr;
        } // end of makerow()


        //삭제버튼시 실행할 기능
        function deleteFunc(e){
            let thisTr = this.parentElement.parentElement; // data-eno
            let eno = this.parentElement.parentElement.dataset.eno;
            fetch('http://localhost:3000/emp/'+eno)
            .then((response) => response.json())
            .then((result) => {
                console.log(result);
                if(result.rowsAffected){
                    alert("성공");
                    thisTr.remove();
                }else{
                    alert("실패");
                }
            })
            .catch((err)=> console.log(err));
        }