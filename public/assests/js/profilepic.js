import { cookie, local, updatePic } from "./function.js";

$(document).ready(function(){
    local().then((user)=>{
        let userid = user;
        $("#userid").val(userid.mobilenumber);
    });
    let file;
    $("#profilepicinput").on('change',function(e){
        file = this.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload=function()
        {
            $("#profilepic").attr('src',reader.result);
            $("#setpicbtn").removeClass("disabled");
        }
    });

    //upload data profilepic
    $(".upload_frm").submit(function(e){
        e.preventDefault();
        //updatePic(file,cookie());
        $.ajax({
            type:'put',
            url:'https://naxivoreal.onrender.com/api/profilepic',
            data:new FormData(this),
            processData:false,
            contentType:false,
            cache:false,
            beforeSend:function(req){},
            success:function(res)
            {
                console.log(res);
                if(res.status == true)
                {
                    window.location.href="profile.html";
                    window.EAPI.openBGW('open big window');
                    localStorage.setItem('userid',JSON.stringify(res.data));
                }
            }
        })
    });
        
});