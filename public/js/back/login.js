// login.js 최종 수정 코드

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert("아이디와 비밀번호를 모두 입력해주세요.");
        return;
    }

    const loginData = {
        username: username,
        password: password,
    };

    fetch('http://192.168.0.9:3000/users/login', { 
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json;charset=utf-8' 
        },
        body: JSON.stringify(loginData),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().catch(() => response.text())
                .then(error => {
                    const errorMessage = typeof error === 'object' && error.message 
                        ? error.message 
                        : (response.status === 401 ? "아이디 또는 비밀번호가 일치하지 않습니다." : "서버 오류가 발생했습니다.");
                    throw new Error(errorMessage);
                });
        }
        return response.json(); 
    })
    .then(result => {
        // 서버에서 user_id와 username이 포함된 성공 응답을 받았다고 가정
        if (!result.user_id || !result.username) {
            throw new Error("서버 응답에 사용자 ID 또는 이름이 누락되었습니다.");
        }
        
        console.log('로그인 성공 응답:', result);
        alert(`로그인 성공! ${result.username}님, 메인 페이지로 이동합니다.`);

        // ⭐⭐⭐ 이 부분이 핵심 수정입니다! ⭐⭐⭐
        // user_id와 username을 쿼리 파라미터로 main.html에 전달
        window.location.href = `main.html?user_id=${result.user_id}&username=${encodeURIComponent(result.username)}`;
        // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    })
    .catch((error) => {
        console.error('로그인 처리 중 오류 발생:', error);
        alert(error.message || "로그인 요청 처리 중 문제가 발생했습니다.");
    });
});