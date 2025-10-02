// 💡 USERS 테이블에 맞춘 회원가입 폼 처리 로직
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault(); // 폼의 기본 제출 동작 방지

    // 1. 폼 데이터 수집
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const email = document.getElementById('email').value.trim();
    const birthYear = document.getElementById('birthYear').value;

    // 2. 유효성 검사: 비밀번호 일치 확인
    if (password !== passwordConfirm) {
        alert("비밀번호와 비밀번호 확인 값이 일치하지 않습니다.");
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
        document.getElementById('password').focus();
        return;
    }
    
    // 3. 서버 전송 데이터 객체 (Node.js의 req.body로 전송됨)
    const userData = {
        username: username, 
        password: password, // 서버에서 'PASSWORD_HASH'로 변환됨
        email: email,       
        birthYear: parseInt(birthYear) // 숫자로 전송
    };

    console.log('회원가입 요청 데이터:', userData);

    // 4. fetch API를 사용하여 서버에 POST 요청
    // 엔드포인트를 회원가입에 맞게 '/users/register'로 변경
    fetch('http://localhost:3000/users/register', { 
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json;charset=utf-8' 
        },
        body: JSON.stringify(userData),
    })
    .then(response => {
        if (!response.ok) {
            // 서버에서 에러 메시지를 받기 위해 JSON 또는 텍스트로 시도
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json(); // 성공 응답 (201 Created)
    })
    .then(result => {
        console.log('회원가입 성공 응답:', result);
        alert("회원가입이 완료되었습니다.");

        // 성공 시, 로그인 페이지로 리다이렉트
        window.location.href = 'login.html'; 
    })
    .catch((error) => {
        console.error('회원가입 처리 중 오류 발생:', error);
        alert("회원가입 처리 중 오류가 발생했습니다. 상세: " + error.message);
    });
});