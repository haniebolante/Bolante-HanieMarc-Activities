function checkOddEven(){
    const num = parseInt(document.getElementById('number').value, 10);
    if(isNaN(num)){
        document.getElementById('result').innerHTML = "Please Enter a valid number.";
        return;
    }
    if(num % 2 === 0){
        document.getElementById('result').innerHTML = num + "is an Even number.";
    }else{
        document.getElementById('result').innerHTML = num + "is an Odd number.";
    }
}