function register() {
    const username = $('#username').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirm_password').val();

    // Clear previous error messages
    $('#message').text('').removeClass('d-block').addClass('d-none');

    // Validate inputs
    if (!username || !password || !confirmPassword) {
        $('#message').text('Please fill in all fields').removeClass('d-none').addClass('d-block');
        return;
    }

    if (password !== confirmPassword) {
        $('#message').text('Passwords do not match').removeClass('d-none').addClass('d-block');
        return;
    }

    $.ajax({
        url: '/register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password }),
        success: function(response) {
            if (response.success) {
                alert('Registration complete!');
                window.location.href = '/';
            } else {
                $('#message').text(response.message).removeClass('d-none').addClass('d-block');
            }
        },
        error: function(xhr, status, error) {
            $('#message').text('Error during registration: ' + error).removeClass('d-none').addClass('d-block');
        }
    });
}
