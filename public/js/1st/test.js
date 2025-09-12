/*
 * test.js
 */

//학생(학생번호: 101, 학생이름: 빡통, 영어: 87, 수학: 90)

let student = [{학생번호: 101}, {학생이름: "배진욱"}, {영어: 100}, {수학: 100}]

let fruits = ["사과", "복숭아", "수박"]


let std = {
    학생번호: 100,
    학생이름: "배진욱",
    영어: 90,
    수학: 90
}

console.log("이름은 " + student[1].학생이름);

student[1].학생이름 = "김만수";
console.log(student[1].학생이름, "의 영어점수는", student[2].영어);
console.log("내가 좋아하는 과일:",fruits[0]);
