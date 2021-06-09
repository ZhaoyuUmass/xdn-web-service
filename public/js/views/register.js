/**
 * Created by gaozy on 8/13/17.
 */

$(document).ready(function(){
    var rv = new RegisterValidator();
    var rc = new RegisterController();

    // jquery post: https://api.jquery.com/jquery.post/
    // $('#register-form').post({})

    $('#register-form').ajaxForm({
        beforeSubmit : function(formData, jqForm, options){
            return rv.validateForm();
        },
        success : function(responseText, status, xhr, $form){
            if (status == 'success') $('.modal-alert').modal('show');
        },
        error: function(e) {
            if (e.responseText == 'email-taken'){
                rv.showInvalidEmail();
            }	else if (e.responseText == 'username-taken'){
                rv.showInvalidUserName();
            }
        }
    });
    $('#name-register').focus();

    $('.modal-alert').modal({ show: false, keyboard: false, backdrop: 'static' });
    $('.modal-alert .modal-header h4').text('Account Created!');
    $('.modal-alert .modal-body p').html('Your account has been created. </br>Click OK to return to the login page.');
});