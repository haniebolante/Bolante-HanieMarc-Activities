function checkGuess(){
    const userGuess = parseInt(document.getElementById('guess').value, 10);
    const message = document.getElementById('message');

    if(!Number(userGuess)) // userGuess < 1 // userGuess > 100){}
        message.innerHTML = "Enter a number between 1 to 100.";
        return;
}
if(userGuess < randomNumber){
    message.innerHTML = "The number is higher.";

}else if(userGuess > randomNumber){
    message.innerHTML = "The number is lower.";
}else {

    message.innerHTML = "You guess the number.";
    message.style.color = "green";
}