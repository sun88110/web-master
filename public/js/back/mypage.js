// mypage.js (비밀번호 변경 기능 및 세션 유지 로직 최종 완성)

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
// UI 토글 함수 (HTML에서 호출됨)
// =======================================================

/**
 * 비밀번호 변경 섹션을 보이거나 숨깁니다.
 */
function togglePasswordSection() {
    const passwordSection = document.getElementById('password-change-section');
    const toggleButtonSection = document.getElementById('toggle-button-section');
    const mainBackBtn = document.getElementById('main-back-btn');

    if (passwordSection && toggleButtonSection && mainBackBtn) {
        // 'hidden' 클래스를 토글하여 보이기/숨기기 전환
        passwordSection.classList.toggle('hidden');
        toggleButtonSection.classList.toggle('hidden');
        
        // 메인으로 돌아가기 버튼도 숨깁니다 (비밀번호 변경 중에는 메인으로 돌아가는 것을 막기 위해)
        mainBackBtn.classList.toggle('hidden');
        
        // 폼이 보일 때 입력 필드를 초기화합니다.
        if (!passwordSection.classList.contains('hidden')) {
             const passwordForm = document.getElementById('password-change-form');
             if(passwordForm) passwordForm.reset();
        }
    } else {
        console.error("비밀번호 변경 섹션 관련 요소를 찾을 수 없습니다.");
    }
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
            if (userData.user) {
                updateUserInfoDisplay(userData.user);
            } else {
                updateUserInfoDisplay(userData);
            }
        } else {
            console.error("사용자 프로필 로딩 실패:", userResponse.status);
        }
        
        // 2. 예산 잔액 및 최근 거래 내역 로딩
        const dataResponse = await fetch(`${API_BASE}/api/data?user_id=${CURRENT_USER_ID}`, {
            cache: 'no-cache' 
        });
        
        if (dataResponse.ok) {
            const data = await dataResponse.json();
            const totalBalance = data.totalBudget || data.balance || data.remaining || 0; 
            updateGoalDisplay(totalBalance); 
            renderTransactionTable(data.recentTransactions || []);

        } else {
            updateGoalDisplay('API 연결 실패 (잔액 로드 불가)'); 
            console.error("예산 및 거래 내역 로딩 실패:", dataResponse.status);
        }
    } catch (error) {
        updateGoalDisplay('네트워크 오류'); 
        handleFetchError(error, "마이페이지 데이터 로딩 중 치명적인 오류가 발생했습니다.");
    }
}

/**
 * 예산/잔액 UI 업데이트
 */
function updateGoalDisplay(balanceAmount) {
    const goalTextEl = document.getElementById('goal-text'); 
    
    if (goalTextEl) {
        if (typeof balanceAmount === 'string' || balanceAmount instanceof String) {
            goalTextEl.innerHTML = `<span style="color: #ef4444;">${balanceAmount}</span>`;
            return;
        }

        const currencyText = formatCurrency(balanceAmount);
        const color = balanceAmount < 0 ? '#ef4444' : '#3b82f6'; 
        
        goalTextEl.innerHTML = `현재 예산: <strong style="color: ${color};">${currencyText}</strong>`;
    } else {
        console.error("HTML 요소 ID 'goal-text'를 찾을 수 없습니다. HTML을 확인하세요.");
    }
}


function updateUserInfoDisplay(user) {
    const usernameEl = document.getElementById('profile-username');
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
// 비밀번호 변경 기능 구현
// =======================================================

/**
 * 비밀번호 변경 폼 제출을 처리합니다.
 */
async function handlePasswordChange(e) {
    e.preventDefault(); 

    if (!CURRENT_USER_ID) {
        alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.");
        return;
    }

    const currentPasswordEl = document.getElementById('current-password');
    const newPasswordEl = document.getElementById('new-password');
    
    const currentPassword = currentPasswordEl ? currentPasswordEl.value.trim() : '';
    const newPassword = newPasswordEl ? newPasswordEl.value.trim() : '';

    if (!currentPassword || !newPassword) {
        alert("현재 비밀번호와 새 비밀번호를 모두 입력해야 합니다.");
        return;
    }

    if (currentPassword === newPassword) {
        alert("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users/password/${CURRENT_USER_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ 비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해 주세요.");
            // 비밀번호 변경 후 로그아웃 처리
            window.location.href = 'login.html'; 
        } else {
            alert(`⚠️ 비밀번호 변경 실패: ${result.message || '알 수 없는 오류'}`);
        }
    } catch (error) {
        handleFetchError(error, "비밀번호 변경 중 네트워크 오류가 발생했습니다.");
    }
}


// =======================================================
// 거래 내역 삭제 (초기화) 로직
// =======================================================

function handleDeleteHistory() { 
    if(confirm('경고: 정말로 모든 거래 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        // 이 기능은 추후 메인 페이지로 이동하여 구현될 예정입니다.
        console.log('거래 내역 삭제 요청 기능 구현 예정'); 
    }
}

// =======================================================
// 초기화 및 이벤트 리스너 등록
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    if (!checkLoginStatus()) {
        return; 
    }
    
    loadMyPageData();
    
    // 1. 메인으로 돌아가기 버튼 연결 (세션 유지)
    const mainBackBtn = document.getElementById('main-back-btn');
    
    if (mainBackBtn && CURRENT_USER_ID && CURRENT_USERNAME) {
        mainBackBtn.onclick = () => { 
             const encodedUsername = encodeURIComponent(CURRENT_USERNAME);
             // 쿼리 파라미터를 사용하여 main.html로 이동 -> 세션 유지
             window.location.href = `main.html?user_id=${CURRENT_USER_ID}&username=${encodedUsername}`;
        };
    }
    
    // 2. 비밀번호 변경 폼 이벤트 연결
    const passwordForm = document.getElementById('password-change-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    } else {
        console.warn("비밀번호 변경 폼 (ID: password-change-form)을 찾을 수 없습니다. HTML을 확인하세요.");
    }
});


// HTML에 정의된 더미 함수들
function handleGoalEdit() { alert('목표/예산 수정 기능은 서버와 연동 후 구현됩니다.'); }
function handleViewAllTransactions() { console.log('전체 거래 내역 페이지로 이동 기능 구현 예정'); }