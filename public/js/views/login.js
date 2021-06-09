
$(document).ready(function(){

	var lv = new LoginValidator();
	var lc = new LoginController();

// main login form //

	$('#login').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (lv.validateForm() == false){
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') {
				//alert(JSON.stringify(responseText));
				window.location.href = '/';
			}
		},
		error : function(e){
			lv.showLoginError('Login Failure', 'Please check your username and/or password');
		}
	}); 
	$('#name-login').focus();
	
// login retrieval form via email //
	
	var ev = new EmailValidator();
	
	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("<b>Error!</b> Please enter a valid email address");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			$('#cancel').html('OK');
			$('#retrieve-password-submit').hide();
			ev.showEmailSuccess("Check your email on how to reset your password.");
		},
		error : function(e){
			if (e.responseText == 'email-not-found'){
				ev.showEmailAlert("Email not found. Are you sure you entered it correctly?");
			}	else{
				$('#cancel').html('OK');
				$('#retrieve-password-submit').hide();
				ev.showEmailAlert("Sorry. There was a problem, please try again later.");
			}
		}
	});
	
});
