import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, child, get, set, onValue, push, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { $, cre, log, uniqueID } from "./cocktail.js"

const firebaseConfig = {
    apiKey: "AIzaSyD2XITbWDRqCkxpIRQF0nbiIGTtMigrrHI",
    authDomain: "fir-rtc-c8330.firebaseapp.com",
    projectId: "fir-rtc-c8330",
    storageBucket: "fir-rtc-c8330.appspot.com",
    messagingSenderId: "1064357637525",
    appId: "1:1064357637525:web:afe024a0390e9f62b5da9c",
    databaseURL: `https://fir-rtc-c8330-default-rtdb.firebaseio.com/`,

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};
const uid = uniqueID();
console.log(uid);
const pc = new RTCPeerConnection(servers);
const remoteStream = new MediaStream();


//make start function 
async function startSTream(video) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

    stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
    });

    pc.addEventListener('track', (ev) => {
        console.log('steeee');
        // ev.streams[0].getTracks().forEach(track => {
        //     remoteStream.addTrack(track)
        // })
        $('#otherVid').srcObject = ev.streams[0]
        $('#otherVid').play()
    })

    $('#otherVid').srcObject = remoteStream;

    return {
        startStream: () => {
            video.srcObject = stream;
            video.play()
        },
        stopVStream: () => {
            stream.getVideoTracks().forEach(track => track.stop())
        },
        stopAStream: () => {
            stream.getAudioTracks().forEach(track => track.stop())
        }
    };
};


let stream;

const id = uniqueID();

async function createRoom(id) {
    stream = await startSTream($('#myVid'));
    stream.startStream();
    const rooms = ref(db, `${id}/${uid}`);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    pc.addEventListener('icecandidate', (ev) => {
        update(rooms, {
            candidate: ev.candidate.toJSON(),
            offer: {
                type: offer.type,
                sdp: offer.sdp
            }
        })

        onValue(ref(db), async (snap) => {
            const data = snap.val()[id];
            // console.log('New data is : ', data);
            for (const key in data) {
                if (key !== uid) {
                    const myRoom = data[key];
    
    
                    if (!pc.currentRemoteDescription && myRoom.answer && myRoom.candidate) {
                        console.log('Set remote description: ', myRoom.answer);
                        const answer = new RTCSessionDescription(myRoom.answer)
                        await pc.setRemoteDescription(answer);
                        console.log(myRoom.candidate , 'demon-slayer');
                        const candidate = new RTCIceCandidate(myRoom.candidate);
                        pc.addIceCandidate(candidate);
    
                    }
                }
            }
        })
    })
    // set(rooms, {
        // offer: {
        //     type: offer.type,
        //     sdp: offer.sdp
        // }

    // })
    // onValue(ref(db), async (snap) => {
    //     const data = snap.val()[id];
    //     console.log('New data is : ', data);
    //     for (const key in data) {
    //         if (key == uid) {
    //             console.log(key);
    //             const myRoom = data[key];


    //             if (!pc.currentRemoteDescription && myRoom.answer && myRoom.candidate) {
    //                 console.log('Set remote description: ', myRoom.answer);
    //                 const answer = new RTCSessionDescription(myRoom.answer)
    //                 await pc.setRemoteDescription(answer);
    //                 console.log(myRoom.candidate , 'demon-slayer');
    //                 const candidate = new RTCIceCandidate(myRoom.candidate);
    //                 pc.addIceCandidate(candidate);

    //             }
    //         }
    //     }
    // })
    $('.idRoom').textContent = `${id}/${uid}`;
    // $('#meet').classList.add('show')
}


// let room = ref(db , '7s3y8J2d4x4U1T2z6K7W5Y');
// let offer = await get(child(room,'offer'));
// console.log(offer.val());

$('#createRoom').on('click', () => {
    createRoom(id)

})


async function joinRoom() {
    const id = $('#jInp').value;
    console.log(id);
    if (!id) { throw new Error('Cocktailjs Error : room id must not be empty!') };
    const room = ref(db, `/${id}`);
    const data = await (await (await get(room, `offer`)).val());
    console.log(data);
    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);


    const mainId = id.split('/')[0];
    const subUser = ref(db, `${mainId}/${uid}`)
    update(subUser, {
        answer: {
            type: answer.type,
            sdp: answer.sdp
        }
    })
    pc.addEventListener('icecandidate', (ev) => {
        const mainId = $('#jInp').value ? $('#jInp').value.split('/')[0] : null;
        const candidate = ev.candidate.toJSON();
        const room = ref(db, `${mainId}/${uid}`);
        if (candidate) [
            update(room, {
                candidate: ev.candidate.toJSON()
            })
        ]
    })
    //add candidate
    const candidate = await data.candidate;
    const PcCandidate = new RTCIceCandidate(candidate);
    pc.addIceCandidate(PcCandidate);
}
//7y8S7g0Z1Q8n7L0J9U8K3I/8t2Y8T4I0U4x2j7c9f6j9e

$('#join').on('click', async () => {
    await (await startSTream($('#myVid'))).startStream()
    joinRoom()
})


// test database firebase 
// set(ref(db , uniqueID()) ,{
//     name:'Yousef',
//     answer:'Test'
// })
// // 
// let room = ref(db,'1D3s5c2T7v8I6A7Q4B7f3O');
// update(room,{
//     update:'updatedd',
//     lol:'lol'
// })

// let subRoom = ref(db,'1D3s5c2T7v8I6A7Q4B7f3O/subRoom');
// set(subRoom,{
//     data:'haha'
// })
