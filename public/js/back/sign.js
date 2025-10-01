/**
 * sign.js
 * 회원가입 페이지 (sign.html)의 클라이언트 측 유효성 검사 및 서버 연동(가정) 로직
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    
    // 입력 필드 요소 가져오기
    const userIdInput = document.getElementById('userid'); 
    const passwordInput = document.getElementById('password');
    const nicknameInput = document.getElementById('nickname');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');

    // 경고 메시지를 표시할 UI 요소를 가정합니다. (alert() 대신 console.log 사용)
    // Canvas 환경에서는 alert() 사용을 피해야 합니다.
    function showCustomAlert(message) {
        // 실제 운영 환경에서는 Custom Modal UI를 사용해야 합니다.
        console.error('⚠️ 회원가입 경고:', message);
        // 에러 메시지를 사용자에게 보여줄 수 있도록 잠시 멈추려면, 
        // return 대신 여기에 모달을 띄우는 로직이 들어가야 합니다.
    }
    
    // ------------------------------------------------------------------
    // 1. 유효성 검사 및 회원가입 제출 처리
    // ------------------------------------------------------------------
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 기본 폼 제출 방지

        // 1-1. 클라이언트 측 필수 입력값 검사
        if (!userIdInput.value || !passwordInput.value || !nicknameInput.value || !nameInput.value || !genderSelect.value) {
            showCustomAlert('아이디, 비밀번호, 닉네임, 이름, 성별은 필수 입력 항목입니다.');
            return;
        }

        // 1-2. 비밀번호 길이 검사 (최소 8자 이상 권장)
        if (passwordInput.value.length < 8) {
            showCustomAlert('비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }

        const newMember = {
            user_id: userIdInput.value.trim(),
            password: passwordInput.value,
            nickname: nicknameInput.value.trim(),
            name: nameInput.value.trim(),
            age: ageInput.value ? parseInt(ageInput.value) : null, // 나이는 선택 항목이며, 입력 시 정수로 변환
            gender: genderSelect.value
        };

        // 1-3. ID 중복 확인 (서버 연동 필요)
        // ***************************************************************
        // TODO: 서버 API 호출 - ID 중복 확인
        // ***************************************************************
        
        // 임시 중복 확인 (DB 연동 전 테스트용)
        if (newMember.user_id === 'testuser') {
            showCustomAlert('이미 사용 중인 아이디입니다. (임시 테스트)');
            return;
        }


        // 1-4. 회원가입 정보 DB에 저장 (서버 연동 필요)
        // ***************************************************************
        // TODO: 서버 API 호출 - member_table에 데이터 삽입 (INSERT)
        // ***************************************************************
        
        // 임시 회원가입 성공 로직
        console.log('✅ 회원가입 성공 - 데이터:', newMember);
        console.log('🎉 회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 이동합니다.');
        window.location.href = 'login.html'; // 로그인 페이지로 이동
    });


    // ------------------------------------------------------------------
    // 2. 서버 연동 함수 (실제 서버 구축 후 채워 넣어야 함)
    // ------------------------------------------------------------------

    // ID 중복 확인 API (예시)
    async function checkIdDuplication(userId) {
        // 서버의 ID 중복 확인 API 엔드포인트에 요청
        /*
        try {
            const response = await fetch(`/api/check-id?user_id=${userId}`);
            const data = await response.json();
            return data.isDuplicate; // true 또는 false 반환
        } catch (error) {
            console.error('ID 중복 확인 중 오류 발생:', error);
            return true; 
        }
        */
        return false; // 임시로 중복 없음으로 설정
    }

    // 회원 등록 API (예시)
    async function registerUser(memberData) {
        // 서버의 회원가입 API 엔드포인트에 POST 요청
        /*
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memberData)
            });
            return response.ok; // HTTP 상태 코드 200-299면 true
        } catch (error) {
            console.error('회원가입 요청 중 오류 발생:', error);
            return false;
        }
        */
        return true; // 임시로 성공으로 설정
    }
});
