var arr = new Array();

document.querySelector("#item")
    .addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.querySelector(".addBtn").click();
        }
    });


document.querySelector(".addBtn")
    .addEventListener("click", function () {
        let item = document.querySelector("#item").value;

        if (item === "") {
            alert("입력값을 확인해주세요!");
            return;
        }

        if (arr.includes(item)) {
            alert("이미 추가된 항목입니다!");
            document.querySelector('#item').value = "";
            return;
        }

        arr.push(item);

        console.log(arr);


        let ul = document.querySelector("#myUL");
        if (!ul) {
            ul = document.createElement("ul");
            ul.id = "myUL";
            document.querySelector("#itemList").appendChild(ul);
        }

        let li = document.createElement("li");
        let span = document.createElement("span");
        span.innerHTML = "X";
        span.setAttribute("class", `close`);
        li.innerHTML = item;
        li.appendChild(span);
        ul.appendChild(li);

        document.querySelector('#item').value = "";

        li.addEventListener("click", function () {
            if (li.className == "checked") {
                li.className = "";
            } else {
                li.setAttribute('class', 'checked');
            }
        });

        span.addEventListener('click', function (e) {
            e.stopPropagation();

            let li = e.target.parentElement;
            let value = li.firstChild.textContent;
            arr = arr.filter(item => item !== value);
            li.remove();
        });
    });