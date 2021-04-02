var qNumber = 1;

const numAnswers = 2;
const maxAnswers = 4;
const rowsQ = 5;
const colsQ = 75;
const rowsA = 1;
const colsA = 40;
const msg_notSupported = "Sorry web storage is not supported!";
const msg_key = "quiz2";
const quizID = "#question-list"

$(document).ready(function() {
	loadData();
	document.getElementById("add").addEventListener("click", function() {
		makeQuestion();
	});
	loadMovies();
  }
);

function updateAnswers(select, qNumber) {
	let totalAns = select.value;
	let question = select.parentNode;
	let existing = []; 
	for (let b = 1; b <= 3; ++b)
		question.removeChild(question.lastChild);
	for (child of question.childNodes) {
		console.log(child)
		if (child.className === "noresize answers")
			existing.push(child)
	}
	let currentAns = existing.length;
	if (currentAns <= totalAns) {
		console.log("adding answers");
		// removing buttons

		for (let i = currentAns; i < totalAns; ++i) {
			let newInput = document.createElement("INPUT");
			newInput.setAttribute("type", "radio");
			newInput.setAttribute("name", "question" + qNumber);
			newInput.setAttribute("value", String.fromCharCode(65 + i));
			let newTextArea = document.createElement("TEXTAREA");
			newTextArea.setAttribute("class", "noresize answers");
			newTextArea.setAttribute("rows", rowsA);
			newTextArea.setAttribute("cols", colsA);
			question.appendChild(newInput);
			question.appendChild(newTextArea);
			question.appendChild(document.createElement("BR"));
		}
			
	} else {
		console.log("deleting answers")
		for (let i = currentAns; i > totalAns; --i) {
			for (let j = 0; j < 3; ++j)
				question.removeChild(question.lastChild);
		}
	}
	
	let saveButton = readdButton("btn btn-success qButton", "quiz", "saveQuestion(this)", "Save")

	let updateButton = readdButton("btn btn-primary qButton", "quiz", "updateQuestion(this)", "Update")

	let deleteButton = readdButton("btn btn-danger qButton", "quiz", "deleteQuestion(this)", "Delete")

	question.appendChild(saveButton);
	question.appendChild(updateButton);
	question.appendChild(deleteButton);
}

function readdButton(classname, name, onclick, text) {
	let button = document.createElement("BUTTON");
	button.setAttribute("class", classname);
	button.setAttribute("name", name);
	button.setAttribute("onclick", onclick);
	button.innerHTML = text;
	return button;
}

function makeChoices(qNumber, id="id", question="") {
	let item = `<li id=${id}><h4>Question ${qNumber}</h4><br/><textarea class="noresize qText" rows="${rowsQ}" cols="${colsQ}">${question}</textarea><br/><p>Answers</p><br/>
					<p>Number of answers:</p><select name="answers${qNumber}" onchange="updateAnswers(this, ${qNumber})">`;
	for (let q = numAnswers; q <= maxAnswers; ++q) {
		item += `<option value=${q}>${q}</option>`;
	}
	item += "</select><br/>";
	return item;
}

function makeQuestion() {
	let list = $(quizID);
	
	let listItem = makeChoices(qNumber);
	
	listItem += addChoice(qNumber, 0, true);
	for (let i = 1; i < numAnswers; ++i) {
		listItem += addChoice(qNumber, i);
	}
	listItem += addButton("save");
	listItem += addButton("update");
	listItem += addButton("delete");
	listItem += `</li>`
	qNumber++;
	list.append(listItem);
}

function saveQuestion(button) {
	let parent = button.parentNode;
	let children = parent.childNodes;
	let information = [];
	let correct = "";
	console.log(parent)
	for (child of children) {
		if (child.tagName == "TEXTAREA")
			information.push(child.value);
		if (child.tagName == "INPUT" && child.checked)
			correct += child.value;
	}
	console.log(information)
	let question = new Question(information[0], information.slice(1), correct);
	console.log(question)

	// sends data to DB as a HTTP request
	queryData(question, "insert", parent);
}

function updateQuestion(button) {
	let parent = button.parentNode;
	let children = parent.childNodes;
	let information = [];
	let correct = "";
	console.log(parent)
	let answerIDs = [];
	for (child of children) {
		if (child.tagName == "TEXTAREA") {
			information.push(child.value);
			let id = child.getAttribute("id");
			if (id != undefined) {
				id = id.replace("ida", "");
				answerIDs.push(parseInt(id));
			}
		}
		if (child.tagName == "INPUT" && child.checked)
			correct += child.value;
	}
	console.log(information)
	let question = new Question(information[0], information.slice(1), correct);
	question.id = parseInt(parent.getAttribute("id").replace("id", ""));
	question.answerIDs = answerIDs;
	console.log(question);

	// sends data to DB as a HTTP request
	queryData(question, "update", parent);
}

function deleteQuestion(button) {
	let parent = button.parentNode;
	let grandParent = parent.parentNode;
	let id = parent.getAttribute("id");
	console.log(id);
	if (id == undefined) {
		grandParent.removeChild(parent);
		return;
	}
		
	id = parseInt(id.replace("id", ""));

	let qData = {
		"id": id
	};
	console.log(qData)

	queryData(qData, "delete");
	grandParent.removeChild(parent);
	if (qNumber > 1)
		--qNumber;
	return qNumber;
}

function addButton(type) {
	let button = ""
	switch(type) {
		case "delete":
			button += `<button id="delete" class="btn btn-danger qButton" name="quiz" onclick="deleteQuestion(this)">Delete</button>`;
			break;
		case "update":
			button += `<button id="update" class="btn btn-primary qButton" name="quiz" onclick="updateQuestion(this)">Update</button>`;
			break;
		case "save":
			button += `<button id="save" class="btn btn-success qButton" name="quiz" onclick="saveQuestion(this)">Save</button>`;
			break;
	}
	return button;
}

function addChoice(qNumber, aNum, checked=false, value="", id="ida") {
	let choice = `<input type="radio" name="question${qNumber}" value="${String.fromCharCode(65 + aNum)}"`;
	if (checked)
		choice += "checked"
	
	choice += `><textarea id=${id} class="noresize answers" rows="${rowsA}" cols="${colsA}">${value}</textarea></input><br/>`;
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
	let correctAns = quizInfo.correct;

	let display = [];
	let qNum = quizInfo.questions.length;
	let a = 0;
	for (let i = 0; i < qNum; ++i) {
		let currAnswers = [];
		let correct = [];
		let aIDs = [];
		while(qIDs[a] == qIDs[a + 1] && a < qIDs.length) {
			currAnswers.push(answers[a]);
			correct.push(correctAns[a]);
			aIDs.push(answerIDs[a]);
			a++;
		}
		aIDs.push(answerIDs[a]);
		currAnswers.push(answers[a]);
		correct.push(correctAns[a]);
		a++;
		let question = makeChoices(i + 1, "id" + qIDs[a - 1], questions[i]);
		for (let j = 0; j < currAnswers.length; ++j) {
			question += addChoice(i, j, correct[j], currAnswers[j], "ida" + aIDs[j]);
		}
		question += addButton("save");
		question += addButton("update");
		question += addButton("delete");
		question += `</li>`;
		display.push(question);
	}
	list.html(display.join(''));
}

function Question(question, answers, correct) {
	this.question = question;
	this.answers = answers;
	this.correct = correct;
}

function loadData() {
	// TO DO
	const xhttp = new XMLHttpRequest();
    const url = "https://young-u6.azurewebsites.net/COMP4537/labs/6/";

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
			let data = JSON.parse(this.responseText);
			console.log(data)
			displayQuestions(data);
			qNumber = data.questions.length + 1;
			makeQuestion();
        }
    }
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-type", "text/plain");
	xhttp.send('normal');
}

function queryData(data, command, parent=null) {
	let qID;
    const xhttp = new XMLHttpRequest();
    const url = "https://young-u6.azurewebsites.net/COMP4537/labs/6/admin.html";

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
			qID = this.responseText;
			if (command == "insert")
	            parent.setAttribute("id", "id" + qID);
        }
    }
    
	data.command = command;
	// convert to JSON string
    let stringData = JSON.stringify(data);
	console.log(stringData);

    // send the data as a POST request
	if (command == "update")
		xhttp.open("PUT", url, true);
	else
	    xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-type", "text/plain");
	xhttp.send(stringData);
	return qID;
}
