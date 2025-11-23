
export async function register(username,mobilenumber,password)
{
    let response;
    await $.ajax({
        type:'post',
        url:'https://naxivoreal.onrender.com/api/register',
        header:{"Content-Type":"application/json"},
        data:{username,mobilenumber,password},
        beforeSend:function(req){},
        success:function(res)
        {
            response = res;
        }
    });

    return response;
}

export async function login(mobilenumber,password)
{
    let response;
    await $.ajax({
        type:'post',
        url:'https://naxivoreal.onrender.com/api/login',
        header:{"Content-Type":"application/json"},
        data:{mobilenumber,password},
        beforeSend:function(req){},
        success:function(res)
        {
            response = res;
        }
    });

    return response;
}

export async function setCook(key,value){
    await window.EAPI.SetCookie({key,value});
}

export  function checkCookie(params) {
    let checkuser = document.cookie.split('userid=')[1];
    if(checkuser != null)
    {
       return true;
    }  
    else
    {
        return false;
    } 
}

export async function local()
{
    let res = await JSON.parse(localStorage.getItem('userid'));
    if(res != '' || res != null)
    {
        return res;
    }
    else
    {
        return 'no pair devices';
    }

}

export function cookie()
{
    return document.cookie.split('userid=')[1];
}

export async function updatePic(profilepic,userid) {
    let response;
    await $.ajax({
        type:'put',
        url:'https://naxivoreal.onrender.com/api/profilepic',
        header:{'Content-Type':'application/json'},
        data:{profilepic,userid},
        cache:false,
        beforeSend:function(req){},
        success:function(res)
        {
            response = res;
        }
    });

    return response;
}

export function userinfo()
{
    return JSON.parse(localStorage.getItem('userid'));
}

export async function addUser(sid,rid)
{
    let response;
    await $.ajax({
         type:'post',
         url:'https://naxivoreal.onrender.com/api/adduser',
         header:{'content-Type':'application/json'},
         data:{sid,rid},
         cache:false,
         beforeSend:function(req){},
         success:function(res)
         {
             response = res;
         }
    });

   return response;
}

export async function useraddlist(uid) {
    let response;
    await $.ajax({
        type:'get',
        url:'https://naxivoreal.onrender.com/api/add-user-list?uid='+uid,
        header:{'Content-Type':'application/json'},
        beforeSend:function(req){},
        success:function(res)
        {
            response = res;
        }
    });

    return response;
}

export async function backpage(params) {
    history.back();
}

export async function logout(params) {
    let log = localStorage.removeItem('userid');
    if(log == undefined)
    {
        return 'logout'
    }
    else
    {
        return 'enything else';
    }
}

export async function userstatus(params) {
    if(navigator.onLine)
    {
        return true;
    }
    else
    {
        return false;
    }
}

export async function checkappisready(params) {
    let response;
    await $.ajax({
        type:'get',
        url:'https://naxivoreal.onrender.com/api/test',
        header:{'content-Type':'application/json'},
        beforeSend:function(req){},
        success:function(res)
        {
            response = res;
        }
    });
    return response;
}

export function PC(localstream) {
    let socket = io('https://naxivoreal.onrender.com');
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
                document.querySelector('#reciverV').srcObject = event.streams[0];
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

    return PC.getInstance();
}
