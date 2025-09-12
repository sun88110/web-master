// while2.js
//let userValue = prompt("숫자를 입력하세요. 종료하려면 exit");
// 학생점수 입력
//while 반복문을 써서 입력받은 학생의 총점수 구하기
let score
let sum = 0;
let userValue;
let cnt = 0;


//평균 = 총합 /명


while (true) {
    userValue = prompt("점수를 입력하세요. 종료하려면 EXIT");
    if (userValue == "exit") {
        console.log(`합계는 ${sum}, 평균은 ${sum/cnt}`);
        break;
    } else {
        sum += parseInt(userValue);
        cnt++;
    }
}

