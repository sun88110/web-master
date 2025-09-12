// for.js
// 반복문.

let sum = 0;

document.writeln(`<table class="table table-dark table-striped"'>`);
document.writeln(`<thead>
                    <tr>
                    <th>단수<th>
                    <th>배수<th>
                    <th>결과<th>
                    </tr>
                    </thead>
                    <tbody>`
                );

for (let i = 1; i <= 10; i = i + 1) {
    document.writeln(`
        <td> 3 </td>
                        <td> * </td>
                        <td> ${i} </td>
                        <td> = </td>
                        <td> ${3 * i} </td>
                        </tr>`);
}

document.writeln(`</tbody></table>`);