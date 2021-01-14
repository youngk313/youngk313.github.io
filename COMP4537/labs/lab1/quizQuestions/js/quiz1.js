function makeQuiz() {
	let list = $("#question-list");
	let listitems = []
	let qNumber = 1;
	for (question of questions) {
		let qString = question.question;
		let listItem = 	`<li><p>${qString}</p><br/>`;
		for (letter in question.answers) {
			listItem +=`<input type="radio" name="question${qNumber}" value="${letter}">
	            		<label for="track">${question.answers[letter]}</label><br />`;
		}
		listItem += `</li>`
		listitems.push(listItem)
		qNumber++;
	}
	list.html(listitems.join(''));
}

$(document).ready(function() {
		makeQuiz()
	}
);