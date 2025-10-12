// mypage.js 파일

// =======================================================
// 전역 설정: (main.js에서 복사하여 재사용)
// =======================================================

const CATEGORIES_MAP = [
    { id: 1, name: '식비' },
    { id: 2, name: '교통' },
    { id: 3, name: '생활' },
    { id: 4, name: '주거' },
    { id: 5, name: '통신' },
    { id: 6, name: '의료' },
    { id: 7, name: '교육' },
    { id: 8, name: '저축' },
    { id: 9, name: '쇼핑' },
    { id: 10, name: '기타' },
];

const API_BASE = 'http://localhost:3000'; // 서버 API 기본 URL

// ⭐ 핵심: 현재 로그인된 사용자의 ID와 이름
let CURRENT_USER_ID = null;
let CURRENT_USERNAME = null;


// =======================================================
// 유틸리티 함수: (main.js에서 복사하여 재사용)
// =======================================================

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return '0원';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

function handleFetchError(error, defaultMsg) {
    console.error('API 처리 중 오류 발생:', error);
    // 404 오류가 발생하지 않더라도, 서버 로직이 불완전할 경우 500 오류 등으로 잡힐 수 있습니다.
    alert(`${defaultMsg} 잠시 후 다시 시도해 주세요. 상세: ${error.message || '알 수 없는 오류'}`);
}


// =======================================================
// 인증 및 초기화
// =======================================================

/**
 * 로그인 상태 확인 및 비로그인 시 강제 리다이렉트 처리
 * @returns {boolean} 로그인 상태 여부
 */
function checkLoginStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    const username = urlParams.get('username');

    if (userId && username) {
        CURRENT_USER_ID = parseInt(userId);
        CURRENT_USERNAME = decodeURIComponent(username);
        return true;
    } else {
        alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
        window.location.href = 'login.html';
        return false;
    }
}

/**
 * 서버에서 사용자 데이터 (프로필)를 가져와 화면에 표시합니다.
 * 목표 예산/최근 거래 내역은 현재 서버에서 반환하지 않으므로 임시로 처리합니다.
 */
async function loadMyPageData() {
    if (!CURRENT_USER_ID) return;

    // 사용자 이름 업데이트
    const titleEl = document.querySelector('h2');
    if (titleEl) {
        titleEl.textContent = `${CURRENT_USERNAME}님의 마이페이지`;
    }

    try {
        // ⭐ 핵심 수정: 서버의 /users/:id 라우트에 맞춥니다.
        const response = await fetch(`${API_BASE}/users/${CURRENT_USER_ID}`); 
        
        if (!response.ok) {
            const errorResult = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            throw new Error(errorResult.message || `마이페이지 데이터 로딩 실패 (상태: ${response.status})`);
        }
        
        const data = await response.json();
        
        if (data.user) {
            // 1. 프로필 정보 표시 (서버에서 가져온 email, birth_year 등)
            updateUserInfoDisplay(data.user);
        } else {
             throw new Error("서버에서 사용자 정보를 찾을 수 없습니다.");
        }
        
        // 2. 목표 예산 및 최근 거래 내역은 현재 API에 없으므로 임시로 표시
        updateGoalDisplay(500000); 
        renderTransactionTable([]); 

    } catch (error) {
        handleFetchError(error, "마이페이지 데이터 로딩에 실패했습니다.");
    }
}

/**
 * 목표 예산 UI 업데이트
 * (현재 서버에서 데이터가 없으므로 임시 값 사용)
 * @param {number} goalAmount
 */
function updateGoalDisplay(goalAmount) {
    const goalDisplayEl = document.getElementById('goal-display');
    if (goalDisplayEl) {
        goalDisplayEl.querySelector('strong').textContent = formatCurrency(goalAmount);
    }
}

/**
 * 사용자 상세 정보를 UI에 반영합니다.
 * (HTML에 'profile-username', 'profile-email', 'profile-birth-year' ID가 있어야 함)
 * @param {Object} user - 서버에서 받은 사용자 객체
 */
function updateUserInfoDisplay(user) {
    // 사용자 이름은 제목에 이미 있으나, 폼 입력 필드에도 반영
    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) usernameEl.value = user.username || '';
    
    const emailEl = document.getElementById('profile-email');
    if (emailEl) emailEl.value = user.email || '';
    
    const birthYearEl = document.getElementById('profile-birth-year');
    if (birthYearEl) birthYearEl.value = user.birth_year || ''; 
    
    // 경고: 비밀번호 해시(PASSWORD_HASH)는 절대 여기에 표시하면 안 됩니다.
}


/**
 * 최근 거래 내역 테이블 렌더링
 * (현재 서버에서 데이터가 없으므로 빈 배열을 처리하도록 유지)
 * @param {Array<Object>} transactions
 */
function renderTransactionTable(transactions) {
    const tbody = document.querySelector('.transaction-history-section tbody');
    if (!tbody) return;
    
    tbody.innerHTML = ''; // 기존 데이터 초기화

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr class="hover:bg-gray-50">
                <td colspan="4" class="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    등록된 최근 거래 내역이 없습니다. (서버 API 미구현)
                </td>
            </tr>
        `;
        return;
    }
    
    // 이 아래 코드는 현재 서버 데이터 구조가 불일치하므로 주석 처리하거나 
    // 실제 서버의 recentTransactions 데이터를 받을 때까지 대기합니다.
    /*
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.slice(0, 10).forEach(tx => { 
        // ... (거래 내역 렌더링 로직)
    });
    */
}


// =======================================================
// 최종 초기화
// =======================================================

window.onload = function() {
    // 1. 로그인 상태 확인 및 세션 (ID, Username) 설정
    if (checkLoginStatus()) {
        // 2. 로그인 상태가 유지되었으므로 데이터 로드 및 UI 업데이트
        loadMyPageData();
        
        // 3. 메인으로 돌아가기 버튼에 쿼리 파라미터 추가 (세션 유지를 위해)
        const backBtn = document.querySelector('.back-to-main-btn');
        if (backBtn && CURRENT_USER_ID && CURRENT_USERNAME) {
            backBtn.onclick = () => {
                const encodedUsername = encodeURIComponent(CURRENT_USERNAME);
                // 세션 정보를 가지고 main.html로 돌아갑니다.
                window.location.href = `main.html?user_id=${CURRENT_USER_ID}&username=${encodedUsername}`;
            };
        }
    }
};

// HTML에 정의된 더미 함수들
function handleGoalEdit() { alert('목표 예산 수정 기능은 서버와 연동 후 구현됩니다.'); }
function handlePasswordChange() { alert('비밀번호 변경 기능은 서버와 연동 후 구현됩니다.'); }
function handleDeleteHistory() { 
    if(confirm('경고: 정말로 모든 거래 내역을 삭제하시겠습니까?')) {
        // DB와 연동하여 삭제하는 로직을 여기에 구현해야 합니다.
        console.log('거래 내역 삭제 요청 기능 구현 예정'); 
    }
}
function handleViewAllTransactions() { console.log('전체 거래 내역 페이지로 이동 기능 구현 예정'); }