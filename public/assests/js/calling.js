import { local, PC, useraddlist , backpage, userinfo} from "./function.js";
$(document).ready(async function(){
    let localstream;
    let caller = new Audio('../toon/caller.mp3');
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
    let socket = io('https://naxivoreal.onrender.com');
    let connection;
    let user = local().then(async (userdata)=>{
        return  userdata.mobilenumber;
    });
    let res = await useraddlist(await user);
    if(res.getadduserdata != undefined)
    {
        res.getadduserdata.forEach(index => {
        let html = `<li class="list-group-item">
                        <div class="d-flex">
                            <img src="${index.rpic}" class="img-fluid img-thumbnail" id="profilepicmenu">
                            <span class="ms-5 mt-3">${index.rusername}</span>
                            <button class="btn btn-light w-50 ms-5 callinguser" type="button" id="callid${index.rid}" sid=${index.sid} spic='${index.spic}' sname='${index.susername}' rid=${index.rid}><i class="fa fa-video animate__animated animate__pulse"></i></button>
                        </div>
                    </li>`;
        $('#scrollvideouser').append(html);
        });
    }
    else
    {
        console.log('no user found');
    }

    $('.callinguser').each(function(){
        $(this).click(function(){
            // $('.hidden').addClass('d-none');
            $('.showvideo').removeClass('d-none');
            let sid = $(this).attr('sid');
            let rid = $(this).attr('rid');
            let sname = $(this).attr('sname');
            let spic = $(this).attr('spic');
            startcall(sid,rid,sname,spic);
        });
    });

async function startcall(sid,rid,sname,spic) {
    $("#calldisconnect").attr('sid',sid);
    $("#calldisconnect").attr('rid',rid);
    let stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    localstream = stream;
    document.getElementById('senderV').srcObject = localstream;
    await sendoffer({sid,rid,sname,spic});
}

async function sendoffer({sid,rid,sname,spic}) {
    caller.play();
    caller.loop = true;
    $('#callid'+rid).addClass('text-warning');
    $('#callid'+rid).html('calling...');
    let pc = await PC.getInstance();
    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer',{sid,rid,sname,spic,offer:pc.localDescription});
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

socket.on('answer',async({sid,rid,sname,spic,answer})=>{
    if(userinfo().mobilenumber == sid)
    {
        caller.pause();
        $('#callid'+rid).removeClass('text-warning');
        $('#callid'+rid).addClass('text-success disabled');
        $('#callid'+rid).html('call connected');
        $("#mute").attr('sid',sid);
        $("#mute").attr('rid',rid);
        $("#calldisconnect").attr('sid',sid);
        $("#calldisconnect").attr('rid',rid);
        $("#cameraoff").attr('sid',sid);
        $("#cameraoff").attr('rid',rid);
        let pc = await PC.getInstance();
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
});

socket.on('candidate',async(candidate)=>{
     let pc = await PC.getInstance();
     await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('calldisconnected',async({sid,rid})=>{
    if(userinfo().mobilenumber == sid)
    {
        $('#callid'+rid).html('<i class="fa fa-video animate__animated animate__pulse"></i>');
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
    }
    else if(userinfo().mobilenumber == rid)
    {
        $('#callid'+sid).html('<i class="fa fa-video animate__animated animate__pulse"></i>');
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
    }
});

socket.on('disconnectcalllocal',({sid,rid,sname,spic})=>{
    if(userinfo().mobilenumber == sid)
    {
        $('.showvideo').addClass('d-none');
        $('#callid'+rid).removeClass('text-warning');
        $('#callid'+rid).addClass('text-danger');
        $('#callid'+rid).html('call disconnected');
        let html =`<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <img src="${spic}" class="rounded me-2 img-fluid img-thumbnail" id="profilepicmenu">
                <strong class="me-auto">call disconnect</strong>
                <small>${sname}</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                The person you want to talk to right now cannot take your call.
            </div>
        </div>`;
        $('.error').html(html);
        setTimeout(() => {
            history.go();
        }, 2000);
    }
    else if(userinfo().mobilenumber == rid)
    {
        $('.showvideo').addClass('d-none');
        $('#callid'+rid).removeClass('text-warning');
        $('#callid'+rid).addClass('text-danger');
        $('#callid'+rid).html('call disconnected');
        let html =`<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <img src="${spic}" class="rounded me-2 img-fluid img-thumbnail" id="profilepicmenu">
                <strong class="me-auto">call disconnect</strong>
                <small>${sname}</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                The person you want to talk to right now cannot take your call.
            </div>
        </div>`;
        $('.error').html(html);
        setTimeout(() => {
            history.go();
        }, 2000);
    }
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
        $('#callid'+rid).html('<i class="fa fa-video animate__animated animate__pulse"></i>');
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


$("#backbtn").click(function(){
    backpage();
});

});
