// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBArIPdlVS4UpyP82DEdjG8xLrVL47Txd0",
  authDomain: "branchmind-fdee1.firebaseapp.com",
  projectId: "branchmind-fdee1",
  storageBucket: "branchmind-fdee1.firebasestorage.app",
  messagingSenderId: "735184472",
  appId: "1:735184472:web:986269e519f2dc1a0d6c2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

export async function uploadFile(file: File, setProgress?: (progress: number)=>void){
    return new Promise((resolve, reject)=>{
        try{
            const storageRef = ref(storage, file.name)
            const uploadTask = uploadBytesResumable(storageRef, file)

            uploadTask.on('state_changed', snapshot => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                if(setProgress) setProgress(progress)
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused')
                    case 'running':
                        console.log('Upload is running')
                }
            }, error => {
                reject(error)
            }, ()=>{
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl=>{
                    resolve(downloadUrl)
                })
            })
        } catch(error){
            console.error(error)
            reject(error)
        }
    })
}