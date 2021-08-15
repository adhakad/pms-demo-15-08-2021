$(document).ready(function(){
  getdata();
  function getdata(){
     $.ajax({
      type : "GET",
      url : "/get",
      dataType:'json',
      success:function(response){
        if(response.msg=='success'){
          var  student_id = response.student_id;
          var  student_name = response.student_name;
/************************************************************************************************************/
// show loading state
const loading = document.createElement("div");
const spin = document.createElement("div");
loading.setAttribute("class", "d-flex loading");
spin.classList.add("loading_spinner");

loading.appendChild(spin);
document.body.appendChild(loading);

const socket = io().connect("/");
const peer = new Peer(student_id, {
  secure: true,
  host: "spanion-video-chat-peer.herokuapp.com",
});

const peers = {};
const newVideoGrid = document.getElementById("newVideoGrid");
const hostVideoGrid = document.getElementById("hostVideoGrid");
const joinVideoGrid = document.getElementById("joinVideoGrid");
const conNewVideoGrid = document.getElementById("conNewVideoGrid");


const newVideo_Text = document.createElement("div");
const newVideo_Item = document.createElement("div");
newVideo_Item.classList.add("newVideo_item");
newVideo_Text.classList.add("newVideo_name");
newVideo_Item.append(newVideo_Text);

const hostVideo_Text = document.createElement("div");
const hostVideo_Item = document.createElement("div");
hostVideo_Item.classList.add("hostVideo_item");
hostVideo_Text.classList.add("hostVideo_name");
hostVideo_Item.append(hostVideo_Text);

const joinVideo_Text = document.createElement("div");
const joinVideo_Item = document.createElement("div");
joinVideo_Item.classList.add("joinVideo_item");
joinVideo_Text.classList.add("joinVideo_name");
joinVideo_Item.append(joinVideo_Text);

const conNewVideo_Text = document.createElement("div");
const conNewVideo_Item = document.createElement("div");
conNewVideo_Item.classList.add("conNewVideo_item");
conNewVideo_Text.classList.add("conNewVideo_name");
conNewVideo_Item.append(conNewVideo_Text)


const mediaConfig = {
  video: true,
  audio: true,
};

peer.on("open", (id) => {
  if (loading) loading.remove();
  socket.emit("join-room", ROOM_ID, { id, name: student_name });
  navigator.mediaDevices
    .getUserMedia(mediaConfig)
    .then((stream) => {
    if(TEACHER_ID){
      const newVideo = document.createElement("video");
      newVideo.muted = true;
      newVideoStream(newVideo, stream, id,student_name);
    }else{
      const hostVideo = document.createElement("video");
      hostVideo.muted = true;
      hostVideo.controls = true;
      hostVideoStream(hostVideo, stream, id,student_name);
    }
    
    peer.on("call", (call) => { 
      call.answer(stream);
      const joinVideo = document.createElement("video");
      joinVideo.controls = true;
      if(TEACHER_ID){
        call.on("stream", (userStream) => {
          const userId = call.peer;
          const userName = call.metadata.name;
          if(userId==TEACHER_ID){
            joinHostVideoStream(joinVideo, userStream,userId,userName);
          }
        });
      }
    });
    if(TEACHER_ID==!id){
      socket.on("user-connected", ({ id, name }) => {
        connectToNewUser({ id, name }, stream);
      });
    }
  })

  .catch((err) => {
    document.write(err);
  });
});

socket.on("user-disconnected", ({ id }) => {
  const video = document.getElementById(id);
  if (video) {
    video.parentElement.remove();
  }
  if (peers[id]) peers[id].close();
});

function connectToNewUser({ id, name }, stream) {
  const call = peer.call(id, stream, { metadata: { name: student_name } });
  const conNewVideo = document.createElement("video");
  conNewVideo.style.height = "25vh";
      call.on("stream", (userStream) => {
        conNewVideoStream(conNewVideo, userStream, id, name);
      });
  call.on("close", () => {
    conNewVideo.remove();
  });
  peers[id] = call;
}

if(TEACHER_ID){
  function newVideoStream(newVideo, stream, id, name) {
    newVideo.srcObject = stream;
    newVideo.addEventListener("loadedmetadata", () => {
      newVideo.play();
    });
    newVideo.setAttribute("id", id);
    const clonedItem = newVideo_Item.cloneNode(true);
    clonedItem.children[0].innerHTML = name;
    clonedItem.append(newVideo);
    newVideoGrid.append(clonedItem);
    const nodes = document.querySelectorAll(".newVideo_item") || [];
    nodes.forEach((node) => {
      if (node.children && node.children.length < 2) {
        node.remove();
      }
    });
  }
}else{
  function hostVideoStream(hostVideo, stream, id, name) {
    hostVideo.srcObject = stream;
    hostVideo.addEventListener("loadedmetadata", () => {
      hostVideo.play();
    });
    hostVideo.setAttribute("id", id);
    const clonedItem = hostVideo_Item.cloneNode(true);
    clonedItem.children[0].innerHTML = name;
    clonedItem.append(hostVideo);
    hostVideoGrid.append(clonedItem);
    const nodes = document.querySelectorAll(".hostVideo_item") || [];
    nodes.forEach((node) => {
      if (node.children && node.children.length < 2) {
        node.remove();
      }
    });   
  }
}
function joinHostVideoStream(joinVideo, stream,id, name) {
  joinVideo.srcObject = stream;
  joinVideo.addEventListener("loadedmetadata", () => {
    joinVideo.play();
  });
  joinVideo.setAttribute("id", id);
  const clonedItem = joinVideo_Item.cloneNode(true);
  clonedItem.children[0].innerHTML = name;
  clonedItem.append(joinVideo);
  joinVideoGrid.append(clonedItem);// weird error cleanup
  const nodes = document.querySelectorAll(".joinVideo_item") || [];
  nodes.forEach((node) => {
    if (node.children && node.children.length < 2) {
      node.remove();
    }
  });
}

function conNewVideoStream(conNewVideo, stream,id, name) {
  conNewVideo.srcObject = stream;
  conNewVideo.addEventListener("loadedmetadata", () => {
    conNewVideo.play();
  });
  conNewVideo.setAttribute("id", id);
  const clonedItem = conNewVideo_Item.cloneNode(true);
  clonedItem.children[0].innerHTML = name;
  clonedItem.append(conNewVideo);
  conNewVideoGrid.append(clonedItem);
  const nodes = document.querySelectorAll(".conNewVideo_item") || [];
  nodes.forEach((node) => {
    if (node.children && node.children.length < 2) {
      node.remove();
    }
  });
}

/************************************************************************************************************/
  
      }
   },
          error:function(response){
              alert('server error');
          }
      });
    
  } 
});
