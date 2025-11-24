import {checkappisready, deleteuser, local, logout, PC, useraddlist, userinfo, userstatus} from './function.js';
$(document).ready(function(){
    let answer = new Audio('assests/toon/reciver.mp3');
    let localstream;
    let socket = io('https://naxivoreal.onrender.com');
    local().then((user)=>{
        if(user == null)
        {
            window.location.href='index.html';
        }
    });

    local().then(async(user)=>{
        let res = await useraddlist(user.mobilenumber);
       if(res.status == true)
       {
            if(res.getadduserdata.length >= 1)
            {
                res.getadduserdata.forEach(index => {
                    let html = `<li class="list-group-item" id="listdelid${index._id}">
                                <div class="d-flex">
                                    <img src="${index.rpic}" class="img-fluid img-thumbnail" id="profilepicmenu">
                                    <span class="ms-3 mt-3" id="status${index.rid}"></span>
                                    <span class="ms-3 mt-3">${index.rusername}</span>
                                    <button class="btn btn-light w-50 ms-5 deleteuser" type="button" id="delid${index._id}" delid=${index._id}><i class="fa fa-trash animate__animated animate__pulse"></i></button>
                                </div>
                            </li>`;
                    $("#insertadduser").append(html);
                });
            }
       }
       else
       {
            let html = `<li class="list-group-item">
                            <div class="d-flex">
                                <span class="status text-center">No Users Added</span>
                            </div>
                        </li>`;
            $("#insertadduser").append(html);
       }

        $('.deleteuser').each(function(){
            $(this).click(async function(){
                $('.spinbox').html('<i class="fa fa-spinner fa-spin"></i>');
                let delid = $(this).attr('delid');
                $("#delid"+delid).html('Please Wait ..');
                let res = await deleteuser(delid);
                if(res.status == true)
                {
                    $('.spinbox').html('');
                    $("#listdelid"+delid).addClass('d-none');
                }
            });
        });
    });
    
    $('.menu').each(function(){
        $(this).click(async function(){
            let  page = $(this).attr('link');
            window.location.href=`assests/pages/${page}.html`;
        });
    });

    $('#profile').click(function(){
        $.ajax({
            type:'post',
            url:'assests/pages/profile.html',
            beforeSend:function(req){},
            success:function(res)
            {
                $(".center").html(res);
            }
        })
    });

    $("#logout").click(function(){
        window.location.href='index.html';
        window.EAPI.quit('quit');
    });

    $("#mainlogout").click(function(){
        if(localStorage.removeItem('userid') == undefined)
        {
            window.EAPI.logout('logout now');
        }
    });

    let PC = (function(){

        let peerconnection;
        let createpeerconnection = ()=>{
            let config = {iceServers:[{urls:"stun:stun4.l.google.com:19302"}]};
            peerconnection = new RTCPeerConnection(config);
            localstream.getTracks().forEach(track =>{
                peerconnection.addTrack(track,localstream);
            });
            peerconnection.ontrack=function(event)
            {
                document.getElementById('reciverV').srcObject = event.streams[0];
            }
            peerconnection.onicecandidate=function(event)
            {
                if(event.candidate)
                {
                    socket.emit("candidate",event.candidate);
                }
            }
            return peerconnection;
        }

        return {
            getInstance: ()=>{
                if(!peerconnection)
                {
                    peerconnection = createpeerconnection(); 
                }
                return peerconnection;
            }
        }
    })();
//calling system
async function reciveoffer({sid,rid,sname,spic,offer}) {
    $("#mute").attr('sid',sid);
    $("#mute").attr('rid',rid);
    $("#calldisconnect").attr('sid',sid);
    $("#calldisconnect").attr('rid',rid);
    $("#cameraoff").attr('sid',sid);
    $("#cameraoff").attr('rid',rid);
    let htm = `<div class="toast show" id="callingshowandhide">
      <div class="toast-header bg-dark">
          <p class="text-light p-0 m-0"><img src="${spic}" alt="" id="profilepicmenu" class="img-fluid img-thumbnail"> <span class="ms-5">Calling From </span> <span class="text-danger ms-5">${sname}</span></p>
      </div>
      <div class="toast-body">
          <div class="btn-group w-100">
          <button class="btn btn-success text-dark callacceptanddecline" type="accept"  sid='${sid}' rid='${rid}' >Accept</button>
          <button class="btn btn-danger  text-dark callacceptanddecline" type="decline" sid='${sid}' rid='${rid}' >Decline</button>
          </div>
      </div>`;
      $('.callings').html(htm);
      $(".callacceptanddecline").each(function(){
            $(this).click(function(){
                answer.pause();
               let type =  $(this).attr('type');
               let sid =  $(this).attr('sid');
               let rid =  $(this).attr('rid');
               if(type == 'decline')
               {
                 socket.emit('disconnectcalllocal',{sid,rid,sname,spic});
                 history.go();
               }
               else
               {
                    $('.callings').html('');
                    $('.showvideo').removeClass('d-none');
                    $('.waittingimg').addClass('d-none');
                    sendanswer({sid,rid,sname,spic,offer});
               }
            });
      });
}

async function sendanswer({sid,rid,sname,spic,offer}) {
    let pc = await PC.getInstance();
    await pc.setRemoteDescription(offer);
    let answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer',{sid,rid,sname,spic,answer:pc.localDescription});
}
async function cameraOF({sid,rid,type}) {
    if(type == "on")
    {
        $("#cameraoff").html('<i class="fa fa-video"></i>');
        $("#cameraoff").attr('type','off');
        localstream.getTracks()[1].enabled = false;
    }
    else
    {
        $("#cameraoff").html('<i class="fa fa-video-slash"></i>');
        $("#cameraoff").attr('type','on');
        localstream.getTracks()[1].enabled = true;
    }
}

async function muted({sid,rid,type}) {
    if(type == "mute")
    {
        $("#mute").html('<i class="fa fa-microphone"></i>');
        $("#mute").attr('type','unmute');
        localstream.getTracks()[0].enabled = false;
    }
    else
    {
        $("#mute").html('<i class="fa fa-microphone-slash"></i>');
        $("#mute").attr('type','mute');
        localstream.getTracks()[0].enabled = true;
    }
}

socket.on('offer',async({sid,rid,sname,spic,offer})=>{
    if(userinfo().mobilenumber == rid)
    {
        await answer.play();
        answer.loop = true;
        let stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        localstream = stream;
        document.getElementById('senderV').srcObject = localstream;
        reciveoffer({sid,rid,sname,spic,offer});
        let notification = new Notification('calling..',{
            body:`calling from ${sname}`,
            icon:spic
        });
        notification.onclick=function()
        {
            reciveoffer({sid,rid,sname,spic,offer});
            window.EAPI.callnotification('callnotification');
        }
    }
});

socket.on('calldisconnected',async({sid,rid})=>{
    local().then(async(user)=>{
        let id = user;
        if(id.mobilenumber == sid)
        {
            $('.showvideo').addClass('d-none');
            let pc = await PC.getInstance();
            if(pc)
            {
                pc.close();
                localstream.getTracks().forEach(track => {
                    track.stop();   // 🔥 यह कैमरा और माइक्रोफ़ोन दोनों बंद कर देता है
                });
                history.go();
            }
            else
            {
                history.go();
            }
        }
        else if(id.mobilenumber == rid)
        {
            $('.showvideo').addClass('d-none');
            let pc = await PC.getInstance();
            if(pc)
            {
                pc.close();
                localstream.getTracks().forEach(track => {
                    track.stop();   // 🔥 यह कैमरा और माइक्रोफ़ोन दोनों बंद कर देता है
                });
                history.go();
            }
            else
            {
                history.go();
            }
        }
    });
});

socket.on('online',(userid)=>{
    $(`#status${userid}`).removeClass('text-danger');
    $(`#status${userid}`).addClass('text-success');
    $(`#status${userid}`).html('online');
});
socket.on('offline',(userid)=>{
    $(`#status${userid}`).removeClass('text-success');
    $(`#status${userid}`).addClass('text-danger');
    $(`#status${userid}`).html('offline');
});

$("#mute").click(function(){
    let sid = $(this).attr('sid');
    let rid  = $(this).attr('rid');
    let type  = $(this).attr('type');
    muted({sid,rid,type});
});
//camera
$("#cameraoff").click(function(){
    let sid = $(this).attr('sid');
    let rid  = $(this).attr('rid');
    let type  = $(this).attr('type');
    cameraOF({sid,rid,type});
});

//call disconnect
$("#calldisconnect").click(async function(){
    let sid = $(this).attr('sid');
    let rid  = $(this).attr('rid');
    let pc = await PC.getInstance();
    if(pc)
    {
        $('.showvideo').addClass('d-none');
        await pc.close();
        socket.emit('calldisconnected',{sid,rid});
        // localstream = null;
        localstream.getTracks().forEach(track => {
            track.stop();   // 🔥 यह कैमरा और माइक्रोफ़ोन दोनों बंद कर देता है
        });
        setTimeout(() => {
            history.go();
        }, 1000);
    }
});

async function status(params) {
    let checkuser = await userstatus();
    if(checkuser == true)
    {
        local().then((user)=>{
            socket.emit('online',user.mobilenumber);
        });
    }
    else
    {
        local().then((user)=>{
            socket.emit('offline',user.mobilenumber);
        });
    }
}
status();

function checkappisrun(params) {
    $('.spinbox').html('<i class="fa fa-circle-o-notch fa-spin text-dark fs-1"> </i>');
    checkappisready().then((data)=>{
        if(data.status == true)
        {
            $('.spinbox').html('');
        }
    })
}

checkappisrun();

});
