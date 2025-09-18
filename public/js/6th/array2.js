// array2.js

const xhtp = new XMLHttpRequest();
xhtp.open('get', '../5th/data.json');
xhtp.send();

xhtp.onload = function() {
    console.log(JSON.parse(xhtp.responseText)); //text로 가져온걸 JSON.parse로 문자열로 가져와서 수정이 편하게함
    // filter , map => 여자 사원 => 사번, (first name + last name) , 급여 
    const employees = JSON.parse(xhtp.responseText);

    employees
        .filter((item) => item.gender == "Female")
        .map((item) => {
        const {id, first_name, last_name, ip_address } = item;
        return {id , name: `${first_name} ${last_name}`, ip_address};
    })
    .forEach((item) => {
        console.log(
            `사번: ${item.id}, 이름: ${item.first_name} ${item.last_name}, IP : ${item.ip_address}`)
        })
    }; 
