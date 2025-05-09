function checkNumber() {
    const num= document.getElementById('guess').value;

    if(num == random){
        document.getElementById('message').innerHTML ="Correct";
    }
    else if (num> random){
        document.getElementById('message').innerHTML ="higher";
    }
    else if(num> random){
        document.getElementById('message').innerHTML ="lower";

    }
tries--;
if(tries> 0){
    document.getElementById('tries').innerHTML= tries;

}
else{
    document.getElementById('tries').innerHTML='failed';
}
}