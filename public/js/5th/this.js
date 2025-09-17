// this.js 

// 1) 함수에서
function sum(n1,n2){
    console.log(this);
    return n1 + n2;
}
sum(1, 2);


// 2) 이벤트)
document.querySelector('table')
    .addEventListener('click', (e) => {
        console.log(e.target);
        console.log(this);
    })

// 3) 객체
const obj ={
    name : "Hong",
    show: function (){
        console.log(this);
        return `이름은 ${this.name}`
    }
}
obj.show();