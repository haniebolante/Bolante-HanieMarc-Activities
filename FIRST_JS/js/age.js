//checkAge
function  checkAge(){
    const age=parseInt (document.getElementById('age').value, 10)

    if(age<= 12){
        document.getElementById('message').innerHTML = "child";
    }else if (age>= 13 && age <=19){
        document.getElementById('message').innerHTML = "teen";
    }else if(age >= 20 && age <= 59){
        document.getElementById('message').innerHTML = "adult";
    }else if(age >=60 && age <= 100){
        document.getElementById('message').innerHTML = "senior citizen";
    }
   

}