// 💡 로그인 폼 처리 로직
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); // 폼의 기본 제출 동작 방지

    // 1. 입력 데이터 수집 및 기본 유효성 검사
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

    console.log('로그인 요청 데이터:', loginData);

    // 2. 서버에 POST 요청 (로그인 API 호출)
    // 서버 엔드포인트를 'http://localhost:3000/users/login'으로 가정합니다.
    fetch('http://localhost:3000/users/login', { 
        method: 'POST',
        headers: { 
            // 서버에 JSON 형식의 데이터를 보냄을 명시
            'Content-Type': 'application/json;charset=utf-8' 
        },
        // JavaScript 객체를 JSON 문자열로 변환하여 전송
        body: JSON.stringify(loginData),
    })
    .then(response => {
        if (!response.ok) {
            // 서버에서 보낸 오류 메시지(JSON 또는 TEXT)를 읽어와 처리
            return response.json().catch(() => response.text())
                .then(error => {
                    // 서버 오류 메시지가 있다면 사용하고, 없다면 기본 메시지 사용
                    const errorMessage = typeof error === 'object' && error.message 
                        ? error.message 
                        : (response.status === 401 ? "아이디 또는 비밀번호가 일치하지 않습니다." : "서버 오류가 발생했습니다.");
                    throw new Error(errorMessage);
                });
        }
        return response.json(); // 성공 응답 (200 OK)
    })
    .then(result => {
        // 서버에서 인증 성공 응답을 받았을 경우
        console.log('로그인 성공 응답:', result);
        
        // 💡 성공 시 메인 페이지로 이동 (예: 'main.html')
        alert("로그인 성공! 메인 페이지로 이동합니다.");
        window.location.href = 'main.html'; 

        // [선택 사항] 서버가 JWT 토큰 등을 반환했다면 여기에 저장합니다.
        // if (result.token) {
        //     localStorage.setItem('authToken', result.token);
        // }
    })
    .catch((error) => {
        // 네트워크 오류 또는 서버 응답 오류 처리
        console.error('로그인 처리 중 오류 발생:', error);
        alert(error.message || "로그인 요청 처리 중 문제가 발생했습니다.");
    });
});