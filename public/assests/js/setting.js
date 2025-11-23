import {register,login,checkCookie, cookie, local, checkappisready} from './function.js';
$(document).ready(function(){
    local().then((data)=>{
        if(data != null)
        {
            if(data.profilepic != 'null')
            {
                 window.location.href='profile.html';
                window.EAPI.openBGW('open big window');
            }
            else
            {
                window.location.href='profilepic.html';
            }
        }
    });
    $(".signshowbtn").click(function(){
        $(".loginbox").addClass('d-none');
        $('.signupbox').removeClass('d-none');
        $('.login_frm')[0].reset();
    });
    $(".loginshowbtn").click(function(){
        $('.signupbox').addClass('d-none');
        $(".loginbox").removeClass('d-none');
        $('.sign_frm')[0].reset();
    }); 

    //registr
    $('.sign_frm').submit(async function(e){
        e.preventDefault();
        $("#signfrmbtn").html(`<i class='fa fa-circle-o-notch fa-spin'></i>`);
        let uname = $("#username").val();
        let number = $("#number").val();
        let password = btoa($("#password").val());
        let sign =  await register(uname,number,password);
        console.log(sign);
        if(sign.status == true)
        {
            $("#signfrmbtn").html(`${sign.message} <i class='fa fa-check-circle text-success'></i>`);
            setTimeout(() => {
                $('.sign_frm')[0].reset();
                $("#signfrmbtn").html('register');
                $('.signupbox').addClass('d-none');
                $(".loginbox").removeClass('d-none');
            }, 1000);
        }
        else
        {
            $("#signfrmbtn").html(`${sign.message} <i class="fa fa-exclamation-triangle text-danger" aria-hidden="true"></i>`);
            setTimeout(() => {
                $("#signfrmbtn").html('register');
            }, 1000);
        }
    });

    $('.login_frm').submit(async function(e){
        e.preventDefault();
        let number = $("#lnumber").val();
        let password = btoa($("#lpassword").val());
        let response = await login(number,password);
        if(response.status == true)
        {
            // $('#loginfrmbtn').html(response.message);
            localStorage.setItem('userid',JSON.stringify(response.data));
            setTimeout(async () => {
            //     // $('#loginfrmbtn').html('Login');

                //get data check profile pic true 
                let {profilepic} = JSON.parse(localStorage.getItem('userid'));
                if(profilepic != 'null')
                {
                    window.location.href='profile.html';
                    window.EAPI.openBGW('open big window');
                }
                else
                {
                    window.location.href='profilepic.html';
                }
            }, 1000);
        }
        else
        {
            $('#loginfrmbtn').html(response.message);
            setTimeout(() => {
                $('#loginfrmbtn').html('Login');
            }, 1000);
        }
    });

    //check app is ready
    checkappisready().then((res)=>{
        if(res.status == true)
        {
            $('.load').addClass('d-none');
        }
    });
});