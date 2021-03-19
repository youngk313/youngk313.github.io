
window.onload=()=>{
	var qNumber = 1;
	var users_answers = [];
	var correct;
	const quizID = "#question-list";
	const rowsQ = 5;
	const colsQ = 75;
	const rowsA = 1;
	const colsA = 40;

	function loadData() {
		// TO DO
		const xhttp = new XMLHttpRequest();
		const url = "https://young-u6.azurewebsites.net/COMP4537/labs/6/";
	
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let data = JSON.parse(this.responseText);
				console.log(data)
				displayQuestions(data);
				correct = data.correct;
				qNumber = data.questions.length + 1;
			}
		}
		xhttp.open("GET", url, true);
		xhttp.setRequestHeader("Content-type", "text/plain");
		xhttp.send();
	}
	

	function makeQuestion(qNumber, id="id", question="") {
		let item = `<li id=${id}><h4>Question ${qNumber}</h4><br/><textarea class="noresize qText" rows="${rowsQ}" cols="${colsQ}" readonly>${question}</textarea><br/>`;
		return item;
	}


	function addChoice(qNumber, aNum, checked=false, value="", id="ida") {
		let choice = `<input type="radio" name="question${qNumber}" value="${String.fromCharCode(65 + aNum)}"`;
		if (checked)
			choice += "checked"
		
		choice += `><textarea id=${id} class="noresize answers" rows="${rowsA}" cols="${colsA}" readonly>${value}</textarea></input><br/>`;
		return choice;
	}


	function displayQuestions(quizInfo) {
		let list = $(quizID);
		if (quizInfo == undefined)
			return;
		let questions = quizInfo.questions;
		let answers = quizInfo.answers;
		let answerIDs = quizInfo.aIDs;
		let qIDs = quizInfo.qIDs;
	
		let display = [];
		let qNum = quizInfo.questions.length;
		let a = 0;
		for (let i = 0; i < qNum; ++i) {
			let currAnswers = [];
			let aIDs = [];
			while(qIDs[a] == qIDs[a + 1] && a < qIDs.length) {
				currAnswers.push(answers[a]);
				aIDs.push(answerIDs[a]);
				a++;
			}
			aIDs.push(answerIDs[a]);
			currAnswers.push(qIDs[a]);
			a++;
			let question = makeQuestion(i + 1, "id" + qIDs[a - 1], questions[i]);
			for (let j = 0; j < currAnswers.length; ++j) {
				question += addChoice(i, j, false, currAnswers[j], "ida" + aIDs[j]);
			}
			question += `</li>`;
			display.push(question);
		}
		list.html(display.join(''));
	}


	function calculateResults(users_answers){
		let correct_choices = 0;
		for(i= 0; i< users_answers.length; i++){
			if(correct[users_answers[i].charCodeAt(0) - 65]){
				correct_choices++;
			}
		}
		return correct_choices
	}

	function submitAnswers(users_answers){
		users_answers.length = 0;
		for(i = 0; i < qNumber; i++){
			var elements = document.getElementsByName(`question${i}`)
			elements.forEach(e => {
				if (e.checked) {
					checkedButton = e.value;
					users_answers.push(e.value);
				}
			});
		}
		console.log(users_answers)
	}

	function displayResults(score){
		document.getElementById("quiz_results").innerHTML = `<p>Your score is ${score}</p><br/>`;
	}

	loadData();

	function handleSubmit(){
		submitAnswers(users_answers);
		let score = calculateResults(users_answers);
		displayResults(score);
	}
	

	document.getElementById("submit_answers").addEventListener("click", handleSubmit);

  };