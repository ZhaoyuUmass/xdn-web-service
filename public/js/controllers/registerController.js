/**
 * Created by gaozy on 8/13/17.
 */

function RegisterController()
{
    $('#register-form-btn2').click(function(){ window.location.href = '/'; });

    $('.modal-alert #ok').click(function(){ setTimeout( function() { window.location.href = '/login'; }, 300);} );
}