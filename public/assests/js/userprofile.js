import {local, userinfo} from './function.js';
$(document).ready(function(){
    let html = `<div class="userprofilebox">
            <div class="d-flex justify-content-center align-items-center flex-column">
                <img src="${userinfo().profilepic}" class="img-fluid img-thumbnail" id="userprofilepic">
                <span class="">${userinfo().username}</span>
            </div>
            <center><span class="mt-2 mb-5">+91${userinfo().mobilenumber}</span></center>
        </div>
        <div class="btn-group w-100 mt-5 mb-5">
            <button class="btn btn btn-warning" type="button" id="btn${userinfo()._id}" uid="${userinfo()._id}" data-bs-toggle="modal" data-bs-target="#myModal">Update Info</button>
            <button class="btn btn btn-danger disabled" type="button"  id="btn${userinfo()._id}" uid="${userinfo()._id}">Delete Account</button>
        </div>`;
    $('.insertprofile').html(html);

    async function updatefrmgetdata(user) {
        let userdata = await user;
        $('#username').val(userdata.username);
        $('#mobilenumber').val(userdata.mobilenumber);   
    }
    updatefrmgetdata(local().then((user)=>{
        return user;
    }));

    $('.update_frm').submit(function(e){
        e.preventDefault();
        $.ajax({
            type:'put',
            url:'https://naxivoreal.onrender.com/api/profile-update',
            data:new FormData(this),
            processData:false,
            contentType:false,
            cache:false,
            beforesend:function(req){$('#updatebtn').html('<i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>')},
            success:function(res)
            {
                if(res.status == true)
                {
                    $('#updatebtn').html('update success <i class="fa fa-check-circle text-success" aria-hidden="true"></i>');
                    localStorage.setItem('userid',JSON.stringify(res.data));
                    setTimeout(()=>{history.go()},1000);
                }
                else
                {
                    alert(res.message);
                }
            }
        })
    });
});