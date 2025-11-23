import {local, addUser,backpage} from './function.js'
$(document).ready(function(){
    $('.add_friends').submit( async function(e){
        e.preventDefault();
        let rid = $('#rid').val();
        let infouser = await local();
        let sid = infouser.mobilenumber;
        $('#adduserbtn').html('<i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>');
        let response = await addUser(sid,rid);
        if(response.status == true)
        {
            $('#adduserbtn').html(`${response.message} <i class="fa fa-check-circle text-success"></i>`);
            setTimeout(() => {
              $('#adduserbtn').html('Add User');
              $(".add_friends")[0].reset();
              history.go();
            }, 2000);
        }
        else
        {
            $('#adduserbtn').html(response.message);
            setTimeout(() => {
                $('#adduserbtn').html('Add User');
            }, 2000);
        }
    });

    // backpage
    $('#backbtn').click(function(){
        backpage();
    });
});