import { local } from "./function.js";

$(document).ready(function(){
    let localstream;
    let socket = io('https://naxivoreal.onrender.com');
    socket.on('connect',()=>{
        console.log('socket connected');
    });

    socket.on('offer',async ({sid,rid,sname,spic,offer})=>{
        if(local().mobilenumber == rid)
        {
            // let stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
            // localstream = stream;
            document.querySelector('#senderV').srcObject = localstream;
            window.EAPI.notification({title:'calling',sid,rid,sname,spic});
            let notify = new Notification('calling',{
                body:`calling from ${sname}`,
                icon:spic
            });
            notify.onclick=function()
            {
                console.log('clicked');
            }
        }
    });

});