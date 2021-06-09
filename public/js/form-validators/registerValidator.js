/**
 * Created by gaozy on 8/11/17.
 */

function RegisterValidator()
{
// build array maps of the form inputs & control groups //

    this.formFields = [$('#name-register'), $('#email-register'), $('#username-register'), $('#pwd-register')];
    this.controlGroups = [$('#name-cg'), $('#email-cg'), $('#username-cg'), $('#pwd-cg')];

// bind the form-error modal window to this controllers to display any errors //

    this.alert = $('.modal-form-errors');
    this.alert.modal({ show : false, keyboard : true, backdrop : true});

    this.validateName = function(s)
    {
        return s.length >= 3;
    }

    this.validatePassword = function(s)
    {
        return s.length >= 6 ;
    }

    this.validateEmail = function(e)
    {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(e);
    }

    this.showErrors = function(a){
        $('.modal-form-errors .modal-body p').text('Please correct the following problem :');
        var ul = $('.modal-form-errors .modal-body ul');
            ul.empty();
        for (var i=0; i < a.length; i++) ul.append('<li>'+a[i]+'</li>');
        this.alert.modal('show');
    }
}

RegisterValidator.prototype.showInvalidEmail = function()
{
    this.controlGroups[1].addClass('error');
    this.showErrors(['That email address is already in use.']);
}

RegisterValidator.prototype.showInvalidUserName = function()
{
    this.controlGroups[2].addClass('error');
    this.showErrors(['That username is already in use.']);
}


RegisterValidator.prototype.validateForm = function()
{
    var e = [];
    for (var i=0; i < this.controlGroups.length; i++) this.controlGroups[i].removeClass('error');
    if ( this.validateName(this.formFields[0].val()) == false ) {
        this.controlGroups[0].addClass('error');
        e.push('Please Enter Your Name');
    }
    if ( this.validateEmail(this.formFields[1].val()) == false ){
        this.controlGroups[1].addClass('error');
        e.push('Please Enter A Valid Email');
    }
    if ( this.validateName(this.formFields[2].val()) == false ) {
        this.controlGroups[2].addClass('error');
        e.push('Please Choose A UserName');
    }
    if( this.validatePassword(this.formFields[3].val()) == false ) {
        this.controlGroups[3].addClass('error');
        e.push('Password Should Be At Least 6 Characters');
    }
    if (e.length) this.showErrors(e);
    return e.length === 0;
}