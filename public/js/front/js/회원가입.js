document.querySelector('button')
    .addEventListener("click", function (e) {
        e.preventDefault(); // 폼 제출 막기

        let id = document.querySelector('#user-id').value;
        let pw1 = document.querySelector('#user-pw1').value;
        let pw2 = document.querySelector('#user-pw2').value;
        let idput = document.getElementById('user-id');
        let pw1put = document.getElementById('user-pw1');
        let pw2put = document.getElementById('user-pw2');

        if (id.length >= 4 && id.length <= 15) {
            console.log(id);
        } else {
            alert("4자 이상 15자 이하로 다시 입력하세요!");
            setTimeout(() => idput.focus(), 0); 
            return;
        }

        if (pw1.length >= 8) {
            console.log(pw1);
        } else {
            document.querySelector('#user-pw1').value = "";
            alert("8자리 이상으로 다시 입력하세요!");
            setTimeout(() => pw1put.focus(), 0);
            return;
        }

        if (pw1 === pw2) {
            alert("회원가입 성공!!");
            console.log(pw2);
        } else {
            document.querySelector('#user-pw2').value = "";
            alert("비밀번호가 일치한지 확인해주세요!");
            setTimeout(() => pw2put.focus(), 0); //
        }
    });