function login() {
    const username = $('#username').val();
    const password = $('#password').val();

    if (!username || !password) {
        $("#message")
            .text("Please enter both username and password")
            .css("color", "red")
            .removeClass("d-none");
        return;
    }
 
    $.ajax({
        url: '/check-user',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password }),
        success: function(response) {
            if (response.success === true) {
                $("#message")
                    .text("Success")
                    .css("color", "green")
                    .removeClass("d-none");
                    
                window.location.href = "/dashboard";
            } else {
                $("#message")
                    .text("Invalid username or password")
                    .css("color", "red")
                    .removeClass("d-none");
            }
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            $("#message")
                .text("Invalid username or password.")
                .css("color", "red")
                .removeClass("d-none");
        }
    }); 
}

function clearRegisterForm() {
    $('#reg_username').val('');
    $('#reg_password').val('');
    $('#confirm_password').val('');
    $('#register_message').text('');
}