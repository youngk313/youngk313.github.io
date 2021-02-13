function sendData() {
    const xhttp = new XMLHttpRequest();
    const url = "https://www.aleksandrasorokina.com/COMP4537/COMP4537.html";

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("result").innerHTML = this.responseText;
        }
    }

    let results = new Object();
    // retrieves input values for name and score
    results["name"] = document.getElementById("input_name").value;
    results["score"] = document.getElementById("input_score").value;
    
    let data = JSON.stringify(results);
    // send the data as a POST request
    xhttp.open("POST", url)
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(data);
}