// mypage.js (잔액 로딩 안정화를 위한 최종 수정)

// =======================================================
// 전역 설정 및 유틸리티 함수
// =======================================================

const CATEGORIES_MAP = [
    { id: 1, name: '식비' }, { id: 2, name: '교통' }, { id: 3, name: '생활' },
    { id: 4, name: '주거' }, { id: 5, name: '통신' }, { id: 6, name: '의료' },
    { id: 7, name: '교육' }, { id: 8, name: '저축' }, { id: 9, name: '쇼핑' },
    { id: 10, name: '기타' },
];

const API_BASE = 'http://localhost:3000'; 
let CURRENT_USER_ID = null;
let CURRENT_USERNAME = null;

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return '0원';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

function handleFetchError(error, defaultMsg) {
    console.error('API 처리 중 오류 발생:', error);
    alert(`${defaultMsg} 잠시 후 다시 시도해 주세요. 상세: ${error.message || '알 수 없는 오류'}`);
}

// =======================================================
// 인증 및 데이터 로딩
// =======================================================

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

async function loadMyPageData() {
    if (!CURRENT_USER_ID) return; 

    const titleEl = document.querySelector('h2');
    if (titleEl) {
        titleEl.textContent = `${CURRENT_USERNAME}님의 마이페이지`;
    }

    try {
        // 1. 프로필 정보 로딩
        const userResponse = await fetch(`${API_BASE}/users/${CURRENT_USER_ID}`); 
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            // userData.user가 있다면 user 정보 업데이트
            if (userData.user) {
                updateUserInfoDisplay(userData.user);
            } else {
                // json-server의 경우, /users/:id 는 바로 객체를 반환할 수 있으므로
                updateUserInfoDisplay(userData);
            }
        } else {
            console.error("사용자 프로필 로딩 실패:", userResponse.status);
        }
        
        // 2. 예산 잔액 및 최근 거래 내역 로딩
        // 🟢 수정된 부분: cache: 'no-cache' 옵션을 추가하여 304 상태 코드를 방지하고 
        // 잔액 로딩(dataResponse.ok)이 확실히 성공하도록 합니다.
        const dataResponse = await fetch(`${API_BASE}/api/data?user_id=${CURRENT_USER_ID}`, {
            cache: 'no-cache' 
        });
        
        if (dataResponse.ok) {
            const data = await dataResponse.json();
            
            // 잔액 필드 유연성 확보: totalBudget, balance, remaining 중 존재하는 값을 사용
            const totalBalance = data.totalBudget || data.balance || data.remaining || 0; 
            
            updateGoalDisplay(totalBalance); 
            
            renderTransactionTable(data.recentTransactions || []);

        } else {
            // 304 상태 코드는 이 블록을 실행시키므로, 캐시 문제 해결 후에는 이 코드가 실행되지 않아야 합니다.
            updateGoalDisplay('API 연결 실패 (잔액 로드 불가)'); 
            console.error("예산 및 거래 내역 로딩 실패:", dataResponse.status);
        }
    } catch (error) {
        updateGoalDisplay('네트워크 오류'); // 네트워크 오류 시 오류 메시지 표시
        handleFetchError(error, "마이페이지 데이터 로딩 중 치명적인 오류가 발생했습니다.");
    }
}

/**
 * 예산/잔액 UI 업데이트
 * @param {number|string} balanceAmount - 잔액 금액 또는 오류 메시지
 */
function updateGoalDisplay(balanceAmount) {
    const goalTextEl = document.getElementById('goal-text'); 
    
    if (goalTextEl) {
        // 숫자가 아닌 경우 (오류 메시지)는 그대로 표시
        if (typeof balanceAmount === 'string' || balanceAmount instanceof String) {
            goalTextEl.innerHTML = `<span style="color: #ef4444;">${balanceAmount}</span>`;
            return;
        }

        const currencyText = formatCurrency(balanceAmount);
        const color = balanceAmount < 0 ? '#ef4444' : '#3b82f6'; 
        
        // 🟢 '로딩 중...' 텍스트를 정확한 잔액으로 대체
        goalTextEl.innerHTML = `현재 예산: <strong style="color: ${color};">${currencyText}</strong>`;
    } else {
        console.error("HTML 요소 ID 'goal-text'를 찾을 수 없습니다. HTML을 확인하세요.");
    }
}


function updateUserInfoDisplay(user) {
    const usernameEl = document.getElementById('profile-username');
    // username이 루트 객체에 있을 경우와 user 객체 내부에 있을 경우 모두 대응
    const userDisplay = user.username || user.name || '';
    if (usernameEl) usernameEl.value = userDisplay;
    
    const emailEl = document.getElementById('profile-email');
    if (emailEl) emailEl.value = user.email || '';
    
    const birthYearEl = document.getElementById('profile-birth-year');
    if (birthYearEl) birthYearEl.value = user.birth_year ? String(user.birth_year) : ''; 
}

function renderTransactionTable(transactions) {
    const tbody = document.querySelector('.transaction-history-section tbody');
    if (!tbody) return;
    
    tbody.innerHTML = ''; 

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr class="hover:bg-gray-50">
                <td colspan="4" class="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    등록된 거래 내역이 없습니다.
                </td>
            </tr>
        `;
        return;
    }
    
    transactions.forEach(tx => { 
        const category = CATEGORIES_MAP.find(c => c.id === tx.category_id)?.name || '미분류';
        const isExpense = tx.type === '지출';
        const amountColor = isExpense ? '#ef4444' : '#3b82f6'; 
        const sign = isExpense ? '-' : '+'; 

        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap">${tx.date}</td>
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap">${category}</td>
                <td class="px-4 sm:px-6 py-4 truncate max-w-xs">${tx.description}</td>
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-right font-semibold" style="color: ${amountColor};">
                    ${sign} ${formatCurrency(Math.abs(tx.amount))}
                </td>
            </tr>
        `;
    });
}

// =======================================================
// 초기화 로직
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    if (!checkLoginStatus()) {
        return; 
    }
    
    loadMyPageData();
    
    const backBtn = document.querySelector('.back-to-main-btn');
    if (backBtn && CURRENT_USER_ID && CURRENT_USERNAME) {
        backBtn.onclick = () => { 
             const encodedUsername = encodeURIComponent(CURRENT_USERNAME);
             window.location.href = `main.html?user_id=${CURRENT_USER_ID}&username=${encodedUsername}`;
        };
    }
});


// HTML에 정의된 더미 함수들
function handleGoalEdit() { alert('목표/예산 수정 기능은 서버와 연동 후 구현됩니다.'); }
function handlePasswordChange() { alert('비밀번호 변경 기능은 서버와 연동 후 구현됩니다.'); }
function handleDeleteHistory() { 
    if(confirm('경고: 정말로 모든 거래 내역을 삭제하시겠습니까?')) {
        console.log('거래 내역 삭제 요청 기능 구현 예정'); 
    }
}
function handleViewAllTransactions() { console.log('전체 거래 내역 페이지로 이동 기능 구현 예정'); }