function showAnswers() {
	let list = $("#question-list");
	let listItems = list.children();
	const numItems = listItems.length;
	for (let i = 0; i < numItems; ++i) {
		let textAnswer = document.createElement("p");
		textAnswer.innerHTML = `Correct Answer: <b>${questions[i].correct}</b>`;
		listItems[i].appendChild(textAnswer);
	}
}

function markAnswers(show) {
	if (show) {
		showAnswers();
		show = false;
	}
	let answers = $("input");
	let score = 0;
	let total = questions.length;
	let userAnswers = $("#question-list li input:checked");
	
	for (let i = 0; i < total; ++i) {
		let correct = questions[i].correct;
		if (userAnswers[i] != undefined && userAnswers[i].value == correct)
			score+= 1;
	}
	$("#result").html(`Score: ${score}/${total}`);
}