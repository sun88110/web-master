//
function cal(){
    let fisrt = parseInt(document.querySelector('#user1').value); // 문자열 숫자, 
    let last = parseInt(document.querySelector('#user2').value); // 문자열 숫자
    
    let opr = document.querySelector('#oper').value; // 연산자 구하기.
    let result = 0;
    console.log(fisrt, last, opr);

    switch(opr){
        case "+":
        result = fisrt + last; break;
        case '-':
        result = fisrt - last; break;
        case '*':
        result = fisrt * last; break;
        case '/':
        result = fisrt / last;
    }

    // if(opr == "+"){
    //     result = fisrt + last; 
    // }else  if(opr == "-"){
    //     result = fisrt - last; 
    // }else  if(opr == "*"){
    //     result = fisrt * last; 
    // }else  if(opr == "/"){
    //     result = fisrt / last; 
    // }
    
    document.querySelector('#result').value = result;
}