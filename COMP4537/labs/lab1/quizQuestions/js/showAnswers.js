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

